/****************************************************************
 * Fracpay client InitPIECE						
 * blairmunroakusa@.0322.anch.AK:				
 *								
 * Lists all accounts under a specific MAIN account.		
 * Pieces are listed numbered to make CLI piece selection easy.	
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

const crypto = require('crypto-js');

import {
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

const InitPIECE = async () => {
	
	try {
	
	// setup
	await establishConnection();
	await establishOperator();
	await checkProgram();

	// get operator ID
	const operatorID = prompt(`Please enter the operator ID: `);	

	// find MAIN address
	const [pdaMAIN, bumpMAIN] = await deriveAddress(toUTF8Array(operatorID));
	console.log(`. Operator MAIN pda:\t${pdaMAIN.toBase58()} found after ${256 - bumpMAIN} tries`);

	// get MAIN data
	const MAIN = await getMAINdata(pdaMAIN);
	
	// print PIECE list
	console.log("\nPieces:\n");
	await printPIECElist(pdaMAIN, MAIN.piececount);

	// get PIECE selection
	var selectPIECE = new Uint16Array(1);
	selectPIECE[0] = 0;
	var pdaPIECEseed = createSeed(pdaMAIN, selectPIECE);
	var [pdaPIECE, bumpPIECE] = await deriveAddress(pdaPIECEseed);

	var PIECE = await getPIECEdata(pdaPIECE);
	console.log("");

	do {
		selectPIECE[0] = parseInt(prompt(`From the PIECE list, please enter PIECE # that you wish to initialize: `));
		// check for valid input
		if (0 >= selectPIECE[0] && selectPIECE[0] >= MAIN.piececount) {
			console.log(`You entered an invalid selection.`);
			continue;
		}
		var pdaPIECEseed = createSeed(pdaMAIN, selectPIECE);
		var [pdaPIECE, bumpPIECE] = await deriveAddress(pdaPIECEseed);
		var PIECE = await getPIECEdata(pdaPIECE);
		if (initFlagCheck(PIECE.flags)) {
			var yesno = prompt(`This PIECE is already initialized. Do you wish to reinititialize? (y/n) `);
			if (yesno === "y") {
				break;
			}
		}
	}
	while (initFlagCheck(PIECE.flags));
	
	// get self REF selection
	var selectREF = new Uint16Array(1);
	selectREF[0] = 0;

	// find self REF address
	var pdaREFseed = createSeed(pdaPIECE, selectREF); 
	var [pdaREF, bumpREF] = await deriveAddress(pdaREFseed);

	console.log(`\nPlease choose an initialization option:`);
	console.log(`0 . Direct balance to your MAIN account`);
	console.log(`1 . Create an invite for someone else to link PIECE`);
	console.log(`2 . Direct balance to somewhere else\n`);
	const invite = parseInt(prompt(`Enter the number that corresponds to your selection: `));

	const ixDATA = [3, invite];
	
	const nullKEY = new PublicKey('11111111111111111111111111111111');

	const InitPIECEtx = (() => {
	       	switch (invite) {
			case 0: {
				// setup instruction data
				return initTX(pdaMAIN, pdaPIECE, pdaREF, nullKEY, pdaMAIN, ixDATA);
			}
			case 1: {
				// create invite key
				const [inviteKEY, hashKEY] = newKeyhash();
				console.log(`\n!!! COPY AND SAVE THIS INVITE KEY !!!`);
				console.log(`${inviteKEY.toBase58()}.PIECE=${PIECE.pieceslug}\n`);
				return initTX(pdaMAIN, pdaPIECE, pdaREF, nullKEY, hashKEY, ixDATA);
			}
			case 2: {
				// get target account
				let target = prompt(`Please paste the recipient's account address: `);
				target = new PublicKey(target);
				return initTX(pdaMAIN, pdaPIECE, pdaREF, nullKEY, target, ixDATA);
			}
			default:
				console.log(`! Invalid selection`);
				process.exit(1);
		}
	})();

	// send transaction
	console.log(`txhash: ${await sendAndConfirmTransaction(connection, InitPIECEtx, [operatorKEY], )}`);

	// confirmation
	console.log(`\n* Successfully initialized PIECE account '${PIECE.pieceslug}' for operator '${operatorID}'!\n`);


	} catch {
		console.log(Error);
	}
};

InitPIECE();


