/****************************************************************
 * Fracpay client FracpayPIECE						
 * blairmunroakusa@.0322.anch.AK:				
 *								
 * . issue fractal payment to a PIECE
 ****************************************************************/

/****************************************************************
 * imports							
 ****************************************************************/

const prompt = require("prompt-sync")({sigint: true});

// misc solana
import {
  	sendAndConfirmTransaction,
	PublicKey,
	LAMPORTS_PER_SOL,
	SystemProgram,
	Transaction,
} from "@solana/web3.js";
import BN = require("bn.js");
const crypto = require('crypto-js');

import {
	MAX_FRACT,
	u32toBytes,
	initFlagCheck,
	busyFlagCheck,
	flipflopFlagCheck,
	operatorKEY,
	connection,
	printPIECElist,
	newKeyhash,
	payTX,
	initTX,
	unpackFlags,
	printREFlist,
	getREFdata,
	deriveAddress,
	createSeed,
	establishConnection,
	establishOperator,
	checkProgram,
	getMAINdata,
	getPIECEdata,
	toUTF8Array,
	sleep,
} from "./utils";

/****************************************************************
 * main								
 ****************************************************************/

const FracpayPIECE = async () => {
	
	try {
		//get started

		// setup
		console.log(``);
		await establishConnection();
		await establishOperator();
		await checkProgram();

		// get operator ID
		console.log(``);
		const operatorID = prompt(`Please enter the operator ID: `);

		// find MAIN address
		const [pdaMAIN, bumpMAIN] = await deriveAddress(toUTF8Array(operatorID));
		console.log(`\n. Operator MAIN pda:\t${pdaMAIN.toBase58()} found after ${256 - bumpMAIN} tries`);

		// get MAIN data
		const MAIN = await getMAINdata(pdaMAIN);

		// get PIECE account
		console.log(``);
		let pdaPIECE = prompt(`Please paste the PIECE account: `);

		// get PIECE data
		pdaPIECE = new PublicKey(pdaPIECE);
		var PIECE = await getPIECEdata(pdaPIECE);

		// get payment amount
		var paymentSOL = 0;
		do {
			console.log(``);
			paymentSOL = prompt(
				`Enter the amount you wish to pay, or enter '0' to only process the PIECE balance: `);

			// check for valid input, double back if invalid
			// TODO, address string entry case
			if (paymentSOL < 0) {
				console.log(`You entered an invalid payment amount, try again.`);
				continue;
			}
			
			break;
		}
		while (true);


	      	// need to figure out how to transfer lamports to PIECE from client side
		//
		// order:
		// 	await transfer confirmation

		// derive all REF addresses and seeds
		var pdaREFs = new Array();
		var pdaREFseeds = new Array();
		var bumpREFs = new Array();
		// initialize ref counter
		var countREF = new Uint16Array(1);
		countREF[0] = 0;
		for (countREF[0]; countREF[0] <= PIECE.refcount; countREF[0]++) {
				
			// find self REF address
			var pdaREFseed = createSeed(pdaPIECE, countREF);
			var [pdaREF, bumpREF] = await deriveAddress(pdaREFseed);
			pdaREFs.push(pdaREF);
			pdaREFseeds.push(pdaREFseed);
			bumpREFs.push(bumpREF);
		}


		// initialize and populate variables
		var REFs = new Array();
		var ffPIECE = false;
		for (countREF[0] = 0; countREF[0] <= PIECE.refcount; countREF[0]++) {
			REFs.push(await getREFdata(pdaREFs[countREF[0]]));
		}
		var payTXfirst = new Transaction()
 			.add(SystemProgram.transfer({
    				fromPubkey: operatorKEY.publicKey,
    				toPubkey: pdaPIECE,
    				lamports: paymentSOL * LAMPORTS_PER_SOL  
			}))

		console.log(`. Successful Payfrac transaction: `,
			    `${await sendAndConfirmTransaction(connection, payTXfirst, [operatorKEY], )}`);
		console.log(`	. Payed ${paymentSOL} to PIECE ${PIECE.pieceslug}`);

		// this first tx turns on busy status to activate following while loop
		// it also reflects the mantra 'pay yourself first'
		var ixDATA = [5].concat(pdaREFseeds[0]);
		payTXfirst = payTX(
				REFs[0].target,
				REFs[0].target,
				pdaPIECE,
				pdaREFs[0],
				pdaREFs[0],
				ixDATA,);

		console.log(`. Successful Payfrac transaction: `,
			    `${await sendAndConfirmTransaction(connection, payTXfirst, [operatorKEY], )}`);

		PIECE = await getPIECEdata(pdaPIECE);
		console.log(`${PIECE.left}`);
		var payTXs = Array();

		// check to see if PIECE is busy running a payment
		while (busyFlagCheck(PIECE.flags)) {
		//if (true) {
			// switch to complete payment mode
		       	console.log(`\n! Fracpay is busy processing a payment for this PIECE.`);	
			console.log(`! We're going to sit here help finish the payment.`);
			
			// get ff flags from piece and self-reference
			ffPIECE = flipflopFlagCheck(PIECE.flags);
			
			// generate transactions for all incomplete REF payments
			for (countREF[0] = 1; countREF[0] <= PIECE.refcount; countREF[0]++) {
				if (flipflopFlagCheck(REFs[countREF[0]].flags) == ffPIECE) {
					console.log('continue');
					continue;
				}
				ixDATA = [5].concat(pdaREFseeds[countREF[0]]);

				payTXs.push(payTX(
					REFs[0].target,
					REFs[countREF[0]].target,
					pdaPIECE,
					pdaREFs[0],
					pdaREFs[countREF[0]],
					ixDATA,));
			}

			// send batch of transaction in parallel
			for (var txno = 0; txno < payTXs.length; txno++) {
				console.log("chirp");
				payTXs[txno] = sendAndConfirmTransaction(connection, payTXs[txno], [operatorKEY], )
			}

			// await tx responses
			for (var txno = 0; txno < payTXs.length; txno++) {
				payTXs[txno] = await payTXs[txno];
				PIECE = await getPIECEdata(pdaPIECE);
				console.log(`${PIECE.left}`);
			}

			// print results
			for (var txno = 0; txno < payTXs.length; txno++) {
				console.log(`. Successful Fracpay transaction: `, payTXs[txno]);
			}
			
			PIECE = await getPIECEdata(pdaPIECE);
			console.log(`${PIECE.left}`);
		}

	} catch {
		console.log(Error);
	}
};

FracpayPIECE();
	

