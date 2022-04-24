/****************************************************************
 * Fracpay client LinkREF						
 * blairmunroakusa@.0424.anch.AK:				
 *								
 * Takes invite key and links REF.		
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
const bs58 = require("bs58");


import {
	findHash,
	initFlagCheck,
	inviteFlagCheck,
	operatorKEY,
	connection,
	printPIECElist,
	newKeyhash,
	linkTX,
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

const LinkREF = async () => {
	
	try {
	
	// setup
	await establishConnection();
	await establishOperator();
	await checkProgram();

	// get operator ID
	console.log(`You have been invited to link a PIECE to a REF.`);	

	// get operator ID
	const operatorID = prompt(`Please enter your operator ID: `);	

	// find MAIN address
	const [pdaMAIN, bumpMAIN] = await deriveAddress(toUTF8Array(operatorID));
	console.log(`. Operator MAIN pda:\t${pdaMAIN.toBase58()} found after ${256 - bumpMAIN} tries`);

	// get MAIN data
	const MAIN = await getMAINdata(pdaMAIN);
	
	// print PIECE list
	console.log("If you have not done so, please create a PIECE that corresponds with the invite REF.")
	console.log("\nThese are the PIECEss you can link, not including your MAIN:\n");
	await printPIECElist(pdaMAIN, MAIN.piececount);

	// get PIECE selection
	var selectPIECE = new Uint16Array(1);

	selectPIECE[0] = parseInt(prompt(`From the PIECE list, please enter PIECE # that you wish to initialize: `));
	// check for valid input
	if (0 >= selectPIECE[0] && selectPIECE[0] >= MAIN.piececount) {
		console.log(`You entered an invalid selection.`);
	}
	var pdaPIECEseed = createSeed(pdaMAIN, selectPIECE);
	var [pdaPIECE, bumpPIECE] = await deriveAddress(pdaPIECEseed);
	var PIECE = await getPIECEdata(pdaPIECE);

	// get and parse invite key
	var [inviteKEY, inviteSLUG] = prompt(`Please paste your invite key: `).split('.REF=');
	console.log(inviteKEY)
	console.log(inviteSLUG)

	// compute the hash from invite key
	var inviteHASH = crypto.SHA256(inviteKEY);
	inviteHASH = bs58.encode(Buffer.from(inviteHASH.toString(), 'hex'));

	// find REF account with target hash
	var REFaccount = await findHash(inviteHASH);
	var pdaREF = REFaccount[0].pubkey;
	
	// setup instruction data
	const ixDATA = [6].concat(inviteHASH)

	// prepare transaction
	const LinkREFtx = linkTX(pdaMAIN, pdaPIECE, pdaREF, ixDATA);

	// send transaction
	console.log(`txhash: ${await sendAndConfirmTransaction(connection, LinkREFtx, [operatorKEY] )}`);	
	

	} catch {
		console.log(Error);
	}
};

LinkREF();


