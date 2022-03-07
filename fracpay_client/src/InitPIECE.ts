/****************************************************************
 * Fracpay client InitPIECE					*	
 * blairmunroakusa@.0322.anch.AK				*
 *								*
 * InitPIECE creates a new piece.				*
 * One each of PIECE, self REF accounts are created.		*
 ****************************************************************/

/****************************************************************
 * imports							*
 ****************************************************************/

const prompt = require("prompt-sync")({sigint: true});
const lodash = require("lodash");

import {
	SystemProgram,
	SYSVAR_RENT_PUBKEY,
  	Transaction,
  	TransactionInstruction,
  	sendAndConfirmTransaction,
} from "@solana/web3.js";

import {
	createSeed,
	deriveAddress,
	getMAINdata,
	establishConnection,
	establishOperator,
	checkProgram,
	toUTF8Array,
} from "./utils";

import {
	fracpayID,
	connection,
	operatorKEY,
	PIECESLUG_SIZE,
} from "./utils";

/****************************************************************
 * main								*
 ****************************************************************/

const InitPIECE = async () => {
	
	try {
	
	// setup
	await establishConnection();
	await establishOperator();
	await checkProgram();

	// get operator ID
	const operatorID = prompt("Please enter your operator ID: ");	

	// find MAIN address
	const [pdaMAIN, bumpMAIN] = await deriveAddress(toUTF8Array(operatorID));
	console.log(`. Operator MAIN pda:\t${pdaMAIN.toBase58()} found after ${256 - bumpMAIN} tries`);
	
	// get MAIN account data
	var MAIN = await getMAINdata(pdaMAIN);
	
	// check to make sure operator has right account
	if (!lodash.isEqual(operatorKEY.publicKey, MAIN.operator)) {
		console.log(`! You don't have the right wallet to add pieces to this account.`,
			    ` Check to see if you have the right Operator ID, or wallet pubkey.`);
		process.exit(1);
	}

	// get PIECE ID
	const PIECEslug = prompt("Please enter the name for your piece: ");
	
	// check to make sure slug is right size
	if (toUTF8Array(PIECEslug).length > PIECESLUG_SIZE) {
		console.log(`! Memory limitations require piece IDs shorter than 63 Bytes (63 standard characters).\n`,
			    ` You chose an ID that exceeds this limit. Please try a smaller ID.`);
		process.exit(1);
	}

	// set new piece count
	var countPIECE = new Uint16Array(1);
	countPIECE[0] = MAIN.piececount + 1;
	console.log(`. This will be PIECE number ${countPIECE[0]}.`);

	// find new piece address
	const pdaPIECEseed = createSeed(pdaMAIN, countPIECE);
	const [pdaPIECE, bumpPIECE] = await deriveAddress(pdaPIECEseed);
	console.log(`. New PIECE pda:\t${pdaPIECE.toBase58()} found after ${256 - bumpPIECE} tries`);
	
	// initial count value is 0
	const countREF = new Uint16Array(1);
	countREF[0] = 0;
	
	// find self REF address
	const pdaREFseed = createSeed(pdaPIECE, countREF);
	const [pdaREF, bumpREF] = await deriveAddress(pdaREFseed);
	console.log(`. New PIECE self-REF:\t${pdaREF.toBase58()} found after ${256 - bumpREF} tries`);

	// setup instruction data
	var ixDATA = [1, bumpPIECE, bumpREF]
		.concat(pdaREFseed)
		.concat(pdaPIECEseed)
		.concat(toUTF8Array(PIECEslug));

	// setup transaction
	let InitPIECEtx = new Transaction().add(
		new TransactionInstruction({
			keys: [
				{ pubkey: operatorKEY.publicKey, isSigner: true, isWritable: true, },
				{ pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false, },
				{ pubkey: pdaMAIN, isSigner: false, isWritable: true, },
				{ pubkey: pdaPIECE, isSigner: false, isWritable: true, },
				{ pubkey: pdaREF, isSigner: false, isWritable: true, },
				{ pubkey: SystemProgram.programId, isSigner: false, isWritable: false, },
			],
			data: Buffer.from(new Uint8Array(ixDATA)),
			programId: fracpayID,
		})
	);

	// send transaction
	console.log(`txhash: ${await sendAndConfirmTransaction(connection, InitPIECEtx, [operatorKEY] )}`);

	} catch {
		console.log(Error);
		console.log(Error.prototype.stack);
	}
};

InitPIECE();
