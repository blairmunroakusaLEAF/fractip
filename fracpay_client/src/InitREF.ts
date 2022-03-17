/****************************************************************
 * Fracpay client InitREF						
 * blairmunroakusa@.0322.anch.AK:				
 *								
 * . Initialize a REF account in one tx:
 * 	. calculate fractions
 * 	. make invite key or get target address
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

const InitREF = async () => {
	
	try {
	
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
	
	// print PIECE list
	console.log("\nPIECEs:\n");
	await printPIECElist(pdaMAIN, MAIN.piececount);

	// get PIECE selection
	var selectPIECE = new Uint16Array(1);
	console.log("");
	selectPIECE[0] = parseInt(prompt(`From the PIECE list, please enter PIECE # that you wish to initialize REFs in: `));
	console.log("");
	
	// check for valid input
	if (0 >= selectPIECE[0] && selectPIECE[0] >= MAIN.piececount) {
		console.log(`You entered an invalid selection.`);
		process.exit(1);
	}

	// find PIECE address
	var pdaPIECEseed = createSeed(pdaMAIN, selectPIECE); 
	var [pdaPIECE, bumpPIECE] = await deriveAddress(pdaPIECEseed);

	// get PIECE data
	var PIECE = await getPIECEdata(pdaPIECE);

	// list REFs
	console.log(`REFs:\n`);
	await printREFlist(pdaPIECE, PIECE.refcount);
	
	// declarations for dowhile scope
	var selectREF = new Uint16Array(1);
	selectREF[0] = 0;
	var pdaREFseed = createSeed(pdaPIECE, selectREF);
	var [pdaREF, bumpREF] = await deriveAddress(pdaREFseed);
	var REF = await getREFdata(pdaREF);

	// get REF selection
	do {
		selectREF[0] = parseInt(prompt(`From the REF list, please enter REF # that you wish to initialize: `));
		console.log(``);

		// check for valid input, double back if invalid
		if (0 >= selectPIECE[0] && selectPIECE[0] >= MAIN.piececount) {
			console.log(`You entered an invalid selection.`);
			continue;
		}

		// check flags at REF selection for prior initialization
		var pdaREFseed = createSeed(pdaPIECE, selectREF);
		var [pdaREF, bumpREF] = await deriveAddress(pdaREFseed);
		var REF = await getREFdata(pdaREF);
		if (initFlagCheck(REF.flags)) {

			// double back if operator does not with to reinitialize
			var yesno = prompt(`This REF is already initialized. Do you wish to reinititialize? (y/n) `);
			console.log(``);
			if (yesno === "y") {
				break;
			}
		}
	}
	while (initFlagCheck(REF.flags));


	// need to pass the self ref bump seed for verification
	let selfref = new Uint16Array(1);
	selfref[0] = 0;
	const pdaselfREFseed = createSeed(pdaPIECE, selfref);
	const [pdaselfREF, bumpselfREF] = await deriveAddress(pdaselfREFseed);
	// pass this on in ix data, and use to get selfref fract
	
	// calculate available fraction
	const selfREF = await getREFdata(pdaselfREF);
	var remainder = selfREF.fract;
	var available = remainder + REF.fract; // this is integer
	var otherfracts = MAX_FRACT - remainder - REF.fract;

	// get fraction from operator
	var fraction = new Uint32Array(1);
	console.log(`\nThe current distribution fraction set for this REF is ${(REF.fract/1000000).toFixed(6)} %`); 
	console.log(`\nThe other initialized REFs divert ${(otherfracts/1000000).toFixed(6)} %`,
		` of incoming funds to other PIECEs\n`);
	console.log(`Please specify a fraction (percent value)`);
	fraction[0] = 1000000 * prompt(`between 0.0 and ${(available/1000000).toFixed(6)} % to divert to PIECE: `);

	// check that input is not too much
	if (fraction[0] > available) {
		console.log(`! This portion is too much!`);
		process.exit(1);
	}

	// if ok input, get invite tag, either  invite key, or target address init
	console.log(`\nPlease choose an initialization option:\n`);
	console.log(`0 . Direct income to known reference PIECE address`);
	console.log(`1 . Create an invite for someone else to link PIECE\n`);
	const invite = parseInt(prompt(`Enter the number that corresponds to your selection: `));

	// prepare ix data ...fraction u32 needs make _shift_ (lolol) function to parse as bytes
	const ixDATA = [4, invite, bumpselfREF].concat(u32toBytes(fraction));

	// prepare tx, dependant on invite tag
	const InitREFtx = (() => {
	       	switch (invite) {
			case 0: {
				// get target account
				console.log(``);
				let target = prompt(`Please paste the recipient PIECE's account address: `);
				console.log(``);
				target = new PublicKey(target);
				return initTX(pdaMAIN, pdaPIECE, pdaREF, pdaselfREF, target, ixDATA);
			}
			case 1: {
				// create invite key via SHA256 hash of random pubkey
				const [inviteKEY, hashKEY] = newKeyhash();
				console.log(`\n!!! COPY AND SAVE THIS INVITE KEY !!!`);
				console.log(`${inviteKEY.toBase58()}.REF=${REF.refslug}\n`);
				return initTX(pdaMAIN, pdaPIECE, pdaREF, pdaselfREF, hashKEY, ixDATA);
			}
			default:
				// selection better be write; I don't have cycles to write more logic
				console.log(`! Invalid selection`);
				process.exit(1);
		}
	})();

	// send transaction
	console.log(`txhash: ${await sendAndConfirmTransaction(connection, InitREFtx, [operatorKEY], )}`);

	// confirmation
	console.log(`\n* Successfully initialized REF account '${REF.refslug}' for PIECE '${PIECE.pieceslug}'!\n`);

	} catch {
		console.log(Error);
	}
};

InitREF();


