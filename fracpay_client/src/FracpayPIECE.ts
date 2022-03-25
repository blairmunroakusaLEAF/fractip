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
} from "@solana/web3.js";
import BN = require("bn.js");
const crypto = require('crypto-js');

import {
	MAX_FRACT,
	u32toBytes,
	initFlagCheck,
	busyFlagCheck,
	operatorKEY,
	connection,
	printPIECElist,
	newKeyhash,
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
/*
		// get payment amount
		var payment = 0;
		do {
			console.log(``);
			payment = prompt(
				`Enter the amount you wish to pay, or enter '0' to only process the PIECE balance: `);

			// check for valid input, double back if invalid
			// TODO, address string entry case
			if (payment < 0) {
				console.log(`You entered an invalid payment amount, try again.`);
				continue;
			}
			
			break;
		}
		while (true);
*/

		// derive all REF addresses and seeds
		var pdaREFs = new Array();
		var bumpREFs = new Array();
		// initialize ref counter
		var countREF = new Uint16Array(1);
		countREF[0] = 0;
		for (countREF[0]; countREF[0] <= PIECE.refcount; countREF[0]++) {
				
			// find self REF address
			var pdaREFseed = createSeed(pdaPIECE, countREF);
			var [pdaREF, bumpREF] = await deriveAddress(pdaREFseed);
			pdaREFs.push(pdaREF);
			bumpREFs.push(bumpREF);
		}

		// check to see if PIECE is busy running a payment
		if (busyFlagCheck(PIECE.flags)) {
		       	console.log(`\n! Fracpay is busy processing a payment for this PIECE.`);	
			console.log(`\n! We're going to sit here and try again until the PIECE is free, or your computer dies.`);
			while (busyFlagCheck(PIECE.flags)) {
				var PIECE = await getPIECEdata(pdaPIECE);



	} catch {
		console.log(Error);
	}
};

FracpayPIECE();
	

