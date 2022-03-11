/****************************************************************
 * Fracpay client ListMAINterse						
 * blairmunroakusa@.0322.anch.AK				
 *								
 * Lists all accounts under a specific MAIN account.		
 * Pieces are listed numbered to make CLI piece selection easy.	
 ****************************************************************/

/****************************************************************
 * imports							
 ****************************************************************/

const prompt = require("prompt-sync")({sigint: true});

import {
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

const ListMAINterse = async () => {
	
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
	console.log(`PIECE tree:\n`);
	
	var countPIECE = new Uint16Array(1);
	countPIECE[0] = 0;

	// find PIECE address
	var pdaPIECEseed = createSeed(pdaMAIN, countPIECE); 
	var [pdaPIECE, bumpPIECE] = await deriveAddress(pdaPIECEseed);

	// get PIECE data
	var PIECE = await getPIECEdata(pdaPIECE);

	// print self PIECE data
	console.log(`# 0\tOPERATOR:\t${PIECE.pieceslug}`);

	// print operator refs
	await printREFlist(pdaPIECE, PIECE.refcount);

	// cycle through all pieces
	for (countPIECE[0] = 1; countPIECE[0] <= MAIN.piececount; countPIECE[0]++) {

		// find PIECE address
		pdaPIECEseed = createSeed(pdaMAIN, countPIECE);
		[pdaPIECE, bumpPIECE] = await deriveAddress(pdaPIECEseed);

		// get PIECE data
		PIECE = await getPIECEdata(pdaPIECE);


		// print PIECE data
		console.log(`# ${countPIECE[0]}\tPIECE ID:\t${PIECE.pieceslug}`);

		// print operator refs
		await printREFlist(pdaPIECE, PIECE.refcount);

	}

	} catch {
		console.log(Error);
	}
};

ListMAINterse();



