/****************************************************************
 * Fracpay client ListPIECE					*	
 * blairmunroakusa@.0322.anch.AK				*
 *								*
 * List PIECE lists all pieces linked to MAIN account.		*
 * Pieces are listed numbered to make CLI piece selection easy.	*
 ****************************************************************/

/****************************************************************
 * imports							*
 ****************************************************************/

const prompt = require("prompt-sync")({sigint: true});

import {
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
 * main								*
 ****************************************************************/

const ListPIECE = async () => {
	
	try {
	
	// setup
	await establishConnection();
	await establishOperator();
	await checkProgram();

	// get operator ID
	const operatorID = prompt("Please enter the operator ID: ");	

	// find MAIN address
	const [pdaMAIN, bumpMAIN] = await deriveAddress(toUTF8Array(operatorID));
	console.log(`. Operator MAIN pda:\t${pdaMAIN.toBase58()} found after ${256 - bumpMAIN} tries`);

	// get MAIN data
	const MAIN = await getMAINdata(pdaMAIN);
	
	// state intention
	console.log(`. Listing ${MAIN.piececount} pieces associated with '${operatorID}' MAIN account.\n`,
		    `\nPIECE\n`);
	
	// initialize piece counter
	var countPIECE = new Uint16Array(1);
	countPIECE[0] = 0;

	// find self PIECE address
	var pdaPIECEseed = createSeed(pdaMAIN, countPIECE);
	var [pdaPIECE, bumpPIECE] = await deriveAddress(pdaPIECEseed);

	// get self PIECE data
	var PIECE = await getPIECEdata(pdaPIECE);

	// print self PIECE data
	console.log(`# 0\tOPERATOR:\t${PIECE.pieceslug}\n`,
		    `\tBALANCE:\t${PIECE.balance}\n`,
		    `\tNETSUM:\t\t${PIECE.netsum}\n`,
		    `\tREF COUNT:\t${PIECE.refcount}\n`);

	// cycle through all pieces
	for (countPIECE[0] = 1; countPIECE[0] <= MAIN.piececount; countPIECE[0]++) {

		// find PIECE address
		pdaPIECEseed = createSeed(pdaMAIN, countPIECE);
		[pdaPIECE, bumpPIECE] = await deriveAddress(pdaPIECEseed);

		// get PIECE data
		PIECE = await getPIECEdata(pdaPIECE);

		// print PIECE data
		console.log(`# ${countPIECE[0]}\tPIECE ID:\t${PIECE.pieceslug}\n`,
			    `\tBALANCE:\t${PIECE.balance}\n`,
			    `\tNETSUM:\t\t${PIECE.netsum}\n`,
			    `\tREF COUNT:\t${PIECE.refcount}\n`);

	}

	} catch {
		console.log(Error);
	}
};

ListPIECE();

