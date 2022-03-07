/****************************************************************
 * Fracpay client CreatePIECE					*	
 * blairmunroakusa@.0322.anch.AK				*
 *								*
 * CreatePIECE creates a new piece.				*
 * One each of PIECE, self REF accounts are created.		*
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
	createSeed,
	deriveAddress,
	getMAINdata,
	establishConnection,
	establishOperator,
	checkProgram,
	toUTF8Array,
} from "./utils";

// utility constants
import {
	connection,
	operatorKEY,
	PIECESLUG_SIZE,
} from "./utils";

/****************************************************************
 * main								*
 ****************************************************************/

const CreatePIECE = async () => {
	
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
	const MAIN = await getMAINdata(pdaMAIN);
	
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
		console.log(`! Memory limitations require piece IDs shorter than 63 Bytes (ie 63 standard characters).\n`,
			    ` You chose an ID that exceeds this limit. Please try a smaller ID.`);
		process.exit(1);
	}

	// set new piece count
	const countPIECE = new Uint16Array(1);
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
	const ixDATA = [1, bumpPIECE, bumpREF]
		.concat(pdaREFseed)
		.concat(pdaPIECEseed)
		.concat(toUTF8Array(PIECEslug));

	// prepare transaction
	const CreatePIECEtx = generalTX(pdaMAIN, pdaPIECE, pdaREF, ixDATA);

	// send transaction
	console.log(`txhash: ${await sendAndConfirmTransaction(connection, CreatePIECEtx, [operatorKEY] )}`);
	
	// confirmation
	console.log(`\n* Successfully created new PIECE account called '${PIECEslug}' for operator '${operatorID}'!\n`);


	} catch {
		console.log(Error);
		console.log(Error.prototype.stack);
	}
};

CreatePIECE();
