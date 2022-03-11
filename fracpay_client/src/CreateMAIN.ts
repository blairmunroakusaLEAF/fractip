/****************************************************************
 * Fracpay client CreateMAIN					*	
 * blairmunroakusa@.0322.anch.AK				*
 *								*
 * CreateMAIN creates a new operator.				*
 * One each of MAIN, self PIECE, self REF accounts are created.	*
 ****************************************************************/

/****************************************************************
 * imports							*
 ****************************************************************/

// misc packages
const prompt = require("prompt-sync")({sigint: true});

// misc solana
import {
  	sendAndConfirmTransaction,
} from "@solana/web3.js";

// utility functions
import {
	createTX,
	deriveAddress,
	availableIDcheck,
	establishConnection,
	establishOperator,
	checkProgram,
	toUTF8Array,
	createSeed,
} from "./utils";

// utility constants
import {
	PIECESLUG_SIZE,
	connection,
	operatorKEY,
} from "./utils";

/****************************************************************
 * main								*
 ****************************************************************/

const CreateMAIN = async () => {
	
	try {
	
	// setup
	await establishConnection();
	await establishOperator();
	await checkProgram();
	
	// get operator ID
	const operatorID = prompt("Please enter your new operator ID: ");	

	// check to make sure ID is right size
	if (toUTF8Array(operatorID).length > PIECESLUG_SIZE) {
		console.log(`! Memory limitations require operator IDs shorter than 63 Bytes (ie 63 standard characters).\n`,
			    ` You chose an ID that exceeds this limit. Please try a smaller ID.`);
		process.exit(1);
	}

	// check to make sure ID is available
	await availableIDcheck(operatorID);

	// initial count values are 0
	const countPIECE = new Uint16Array(1);
	const countREF = new Uint16Array(1);
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

	// prepare transaction
	const CreateMAINtx = createTX(pdaMAIN, pdaPIECE, pdaREF, ixDATA);
       
	// send transaction
	console.log(`txhash: ${await sendAndConfirmTransaction(connection, CreateMAINtx, [operatorKEY], )}`);
	
	// confirmation
	console.log(`\n* Successfully created new MAIN account for operator '${operatorID}'!\n`);

	} catch {

	console.log(Error);

	}
};

CreateMAIN();

