/****************************************************************
 * Fracpay client CreateREF					*	
 * blairmunroakusa@.0322.anch.AK				*
 *								*
 * CreateREF creates a new reference.				*
 * One uninitialized REF account is created.			*
 ****************************************************************/

/****************************************************************
 * imports							*
 ****************************************************************/

// misc packages
const prompt = require("prompt-sync")({sigint: true});
const lodash = require("lodash");

// misc solana
import {
	sendAndConfirmTransaction,
} from "@solana/web3.js";

// utility functions
import {
	generalTX,
	getPIECEdata,
	getMAINdata,
	deriveAddress,
	createSeed,
	printPIECElist,
	establishConnection,
	establishOperator,
	checkProgram,
	toUTF8Array,
} from "./utils";

// utility constants
import {
	connection,
	operatorKEY,
	REFSLUG_SIZE,
} from "./utils";

/****************************************************************
 * main								*
 ****************************************************************/

const CreateREF = async () => {
	
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
	console.log(`. \nThere are ${MAIN.piececount} pieces associated with '${operatorID}' MAIN account.\n`);
		
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
	const [pdaPIECE, bumpPIECE] = await deriveAddress(pdaPIECEseed);
	var PIECE = await getPIECEdata(pdaPIECE);

	// get REF ID
	const REFslug = prompt("Please enter name for your reference under 20 Bytes (ie under 20 standard characters): ");

	// check to make sure slug is under limit
	if (toUTF8Array(REFslug).length > REFSLUG_SIZE) {
		console.log(`! Memory limitations require REF IDs shorter than 20 Bytes (ie 20 standard characters).\n`,
			    ` You chose an ID that exceeds this limit. Please try a new ID.`
		);
		process.exit(1);
	}

	// check to make sure operator is authorized to add ref
	if (!lodash.isEqual(operatorKEY.publicKey, PIECE.operator)) {
		console.log(`! You don't have the right wallet to add refs to this particular piece.\n`,
			    ` Check to see if you have the right Operator ID, or wallet pubkey.`
		);
		process.exit(1);
	}

	// set new REF count
	var countREF = new Uint16Array(1);
	countREF[0] = PIECE.refcount + 1;
	console.log(`. This will be REF number ${countREF[0]}.`);

	// find new ref address
	const pdaREFseed = createSeed(pdaPIECE, countREF);
	const [pdaREF, bumpREF] = await deriveAddress(pdaREFseed);
	console.log(`. New REF pda:\t${pdaPIECE.toBase58()} found after ${256 - bumpPIECE} tries`);

	// setup instruction data
	var ixDATA = [2, bumpREF]
		.concat(pdaREFseed)
		.concat(toUTF8Array(REFslug));
	
	// prepare transaction
	const CreateREFtx = generalTX(pdaMAIN, pdaPIECE, pdaREF, ixDATA);
	
	// send transaction
	console.log(`txhash: ${await sendAndConfirmTransaction(connection, CreateREFtx, [operatorKEY] )}`);

	// confirmation
	console.log(`\n* Successfully created new REF account called '${REFslug}'`,
		    ` for PIECE account '${PIECE.pieceslug}' owned by operator '${operatorID}'!\n`);

	} catch {
		console.log(Error);
		console.log(Error.prototype.stack);
	}
};

CreateREF();

