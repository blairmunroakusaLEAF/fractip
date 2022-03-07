/****************************************************************
 * Fracpay client InitREF					*	
 * blairmunroakusa@.0322.anch.AK				*
 *								*
 * InitREF creates a new reference.				*
 * One uninitialized REF account is created.			*
 ****************************************************************/

/*
 * INCOMPLETE--NEED TO DIAL IN InitPIECE FIRST
 * . NEED TO CREATE ListPIECE CLIENT FUNCTION
 * . NEED TO CREATE ChoosePIECE CLIENT FUNCTION
 * . NEED TO CREATE TEST ACCOUNT WITH MULTIPLE EMPTY PIECES

/****************************************************************
 * imports							*
 ****************************************************************/

const prompt = require("prompt-sync")({sigint: true});
const lodash = require("lodash");

import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  clusterApiUrl,
  SYSVAR_RENT_PUBKEY,
  LAMPORTS_PER_SOL,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

import {
	getMAINdata,
	deriveAddress,
	createSeed,
	printPIECElist,
	establishConnection,
	establishOperator,
	checkProgram,
	getProgramID,
	getKeypair,
	toUTF8Array,
} from "./utils";

import {
	fracpayID,
	connection,
	operatorKEY,
	MAIN_SIZE,
	PIECE_SIZE,
	FLAGS_SIZE,
	PUBKEY_SIZE,
	BALANCE_SIZE,
	NETSUM_SIZE,
	COUNT_SIZE,
	PIECESLUG_SIZE,
	MAIN_DATA_LAYOUT,
	MAINlayout,
	PIECE_DATA_LAYOUT,
	PIECElayout,
} from "./utils";

/****************************************************************
 * main								*
 ****************************************************************/

const InitREF = async () => {
	
	try {
	
	// setup
	await establishConnection();
	await establishOperator();
	await checkProgram();

	// get operator ID
	const operatorID = prompt("Please enter your operator ID: ");

	// find MAIN address
	let [pdaMAIN, bumpMAIN] = await deriveAddress(toUTF8Array(operatorID));
	console.log(`. Operator MAIN pda:\t${pdaMAIN.toBase58()} found after ${256 - bumpMAIN} tries`);

	// get MAIN account data
	var MAIN = await getMAINdata(pdaMAIN);

	// check to make sure operator has right account
	if (!lodash.isEqual(operatorKEY.publicKey, MAIN.operator)) {
		console.log(`! You don't have the right wallet to add pieces to this account.`,
			    ` Check to see if you have the right Operator ID, or wallet pubkey.`);
		process.exit(1);
	}

	// state intention
	console.log(`. Listing ${MAIN.piececount} pieces associated with '${operatorID}' MAIN account.\n`,
		    `\nPIECE\n`);
	
	// print PIECE list
	await printPIECElist(pdaMAIN, MAIN.piececount);

	// get PIECE selection
	var selectPIECE = new Uint16Array(1);
	selectPIECE[0] = parseInt(prompt("From the PIECE list, please enter # or SELF to add REF to: "));

	// check PIECE selection input
	if (selectPIECE[0] < 0 || selectPIECE[0] > MAIN.piececount) {
		console.log(`! You made an invalid selection. Type in a number, nothing else.`);
		process.exit(1);
	}

	// get selected PIECE data
	const pdaPIECEseed = createSeed(pdaMAIN, selectPIECE);
	const [pdaPIECE, bumpPIECE] = await deriveAccount(pdaPIECEseed);
	var PIECE = await getPIECEdata(pdaPIECE);

	// get REF ID
	const REFslug = prompt("Please enter the name for your reference (under 20 standard characters): ");

	// check to make sure slug is under limit
	if (toUTF8Array(REFslug).length > REFSLUG_SIZE) {
		console.log(`! Memory limitations require reference IDs shorter than 20 Bytes (20 standard characters).\n`,
			    ` You chose an ID that exceeds this limit. Please try a new ID.`
		);
		process.exit(1);
	}

	// check to make sure operator is authorized to add ref
	if (!lodash.isEqual(operator.publicKey, MAIN.operator)) {
		console.log(`! You don't have the right wallet to add refs to pieces on this account.\n`,
			    ` Check to see if you have the right Operator ID, or wallet pubkey.`
		);
		process.exit(1);
	}
/*	
	// get the right PIECE account data

	// if input selection is number from printed list,

	// find PIECE address
	//
	// create PIECE pda seed	
	let countPIECElow = countPIECE[0] & 0xFF; // mask for low order count byte
	let countPIECEhigh = (countPIECE[0] >> 8) & 0xFF; // shift and mask for high order count byte
	var pdaPIECEseed = toUTF8Array(pdaMAIN
				       .toString()
				       .slice(0, PUBKEY_SIZE - COUNT_SIZE))
				       .concat(countPIECEhigh, countPIECElow);	

	let [pdaPIECE, bumpPIECE] = await PublicKey.findProgramAddress(
		[new Uint8Array(pdaPIECEseed)], fracpayID);
	console.log(`. New PIECE pda:\t\t${pdaPIECE.toBase58()} found after ${256 - bumpPIECE} tries`);
	
	// check payfract for pdaMAIN associated with operatorID
	//...leaving this for now
	
	// set new ref count
	var countPIECE = new Uint16Array(1);
	countPIECE[0] = MAIN.piececount + 1;
	console.log(`. This will be PIECE number ${countPIECE[0]}.`);


	// find REF address
	//
	// create self REF pda seed
	var countREF = new Uint16Array(1);
	countREF[0] = 0;

	let countREFlow = countREF[0] & 0xFF;
	let countREFhigh = (countREF[0] >> 8) & 0xFF;
	var pdaREFseed = toUTF8Array(pdaPIECE
				     .toString()
				     .slice(0, PUBKEY_SIZE - COUNT_SIZE))
				     .concat(countREFhigh, countREFlow);

	let [pdaREF, bumpREF] = await PublicKey.findProgramAddress(
		[Buffer.from(new Uint8Array(pdaREFseed))], fracpayID);
	console.log(`. New PIECE self-REF pda:\t\t${pdaREF.toBase58()} found after ${256 - bumpREF} tries`);
	
	// setup instruction data
	var ixDATA = [1, bumpPIECE, bumpREF]
		.concat(pdaREFseed)
		.concat(pdaPIECEseed)
		.concat(toUTF8Array(PIECEslug));

	// setup transaction
	let InitPIECEtx = new Transaction().add(
		new TransactionInstruction({
			keys: [
				{ pubkey: operator.publicKey, isSigner: true, isWritable: true, },
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
	console.log(`txhash: ${await sendAndConfirmTransaction(connection, InitPIECEtx, [operator], )}`);
*/


	} catch {
		console.log(Error);
		console.log(Error.prototype.stack);
	}
};

InitREF();

