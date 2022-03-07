/****************************************************************
 * Fracpay client InitMAIN					*	
 * blairmunroakusa@.0322.anch.AK				*
 *								*
 * InitMAIN creates a new operator.				*
 * One each of MAIN, self PIECE, self REF accounts are created.	*
 ****************************************************************/

/****************************************************************
 * imports							*
 ****************************************************************/

const prompt = require("prompt-sync")({sigint: true});

import {
	SystemProgram,
  	SYSVAR_RENT_PUBKEY,
  	Transaction,
  	TransactionInstruction,
  	sendAndConfirmTransaction,
} from "@solana/web3.js";

import {
	deriveAddress,
	availableIDcheck,
	establishConnection,
	establishOperator,
	checkProgram,
	toUTF8Array,
	createSeed,
} from "./utils";

import {
	PIECESLUG_SIZE,
	fracpayID,
	connection,
	operatorKEY,
} from "./utils";

/****************************************************************
 * main								*
 ****************************************************************/

const InitMAIN = async () => {
	
	try {
	
	// setup
	await establishConnection();
	await establishOperator();
	await checkProgram();
	
	// get operator ID
	const operatorID = prompt("Please enter your new operator ID: ");	

	// check to make sure ID is right size
	if (toUTF8Array(operatorID).length > PIECESLUG_SIZE) {
		console.log(`! Memory limitations require operator IDs shorter than 63 Bytes (63 standard characters).\n`,
			    ` You chose an ID that exceeds this limit. Please try a smaller ID.`);
		process.exit(1);
	}

	// check to make sure ID is available
	await availableIDcheck(operatorID);

	// initial count values are 0
	var countPIECE = new Uint16Array(1);
	var countREF = new Uint16Array(1);
	countPIECE[0] = 0;
	countREF[0] = 0;

	// find MAIN address
	const [pdaMAIN, bumpMAIN] = await deriveAddress(toUTF8Array(operatorID));
	console.log(`. New MAIN pda:\t\t${pdaMAIN.toBase58()} found after ${256 - bumpMAIN} tries`);

	// find self PIECE address
	const pdaPIECEseed = createSeed(pdaMAIN, countPIECE);
	const [pdaPIECE, bumpPIECE] = await deriveAddress(pdaPIECEseed);
	console.log(`. New MAIN self-PIECE:\t${pdaPIECE.toBase58()} found after ${256 - bumpPIECE} tries`);

	// find self REF address
	const pdaREFseed = createSeed(pdaPIECE, countREF);
	const [pdaREF, bumpREF] = await deriveAddress(pdaREFseed);
	console.log(`. New PIECE self-REF:\t${pdaREF.toBase58()} found after ${256 - bumpREF} tries`);

	// setup instruction data
	const ixDATA = [0, bumpMAIN, bumpPIECE, bumpREF]
		.concat(pdaREFseed)
		.concat(pdaPIECEseed)
		.concat(toUTF8Array(operatorID));

	// setup transaction
	const InitMAINtx = new Transaction().add(
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
	console.log(`txhash: ${await sendAndConfirmTransaction(connection, InitMAINtx, [operatorKEY], )}`);

	} catch {

	console.log(Error);

	}
};

InitMAIN();

