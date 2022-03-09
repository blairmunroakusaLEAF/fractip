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
	verboseREFlist,
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
 * main								*
 ****************************************************************/

const TreePIECEverbose = async () => {
	
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

	// get flags
	var flags = unpackFlags(PIECE.flags);

	// print self PIECE data
	console.log(`# 0\t| OPERATOR: ----> ${PIECE.pieceslug}`);
	console.log(`\t| BALANCE: -----> ${PIECE.balance}`);
	console.log(`\t| NETSUM: ------> ${PIECE.netsum}`);
	process.stdout.write(`\t| FLAGS: -------> `);
	process.stdout.write(`[ `);
	for (var index = 0; index < 4; index++) {
		process.stdout.write(`${flags[index]} `);
	}
	process.stdout.write(`| `);
	for (var index = 4; index < 8; index++) {
		process.stdout.write(`${flags[index]} `);
	}
	process.stdout.write(`| `);
	for (var index = 8; index < 12; index++) {
		process.stdout.write(`${flags[index]} `);
	}
	process.stdout.write(`| `);
	for (var index = 12; index < 16; index++) {
		process.stdout.write(`${flags[index]} `);
	}
	process.stdout.write(`]`);
		process.stdout.write(`\n\n`);

	// print operator refs
	await verboseREFlist(pdaPIECE, PIECE.refcount);

	// cycle through all pieces
	for (countPIECE[0] = 1; countPIECE[0] <= MAIN.piececount; countPIECE[0]++) {

		// find PIECE address
		pdaPIECEseed = createSeed(pdaMAIN, countPIECE);
		[pdaPIECE, bumpPIECE] = await deriveAddress(pdaPIECEseed);

		// get PIECE data
		PIECE = await getPIECEdata(pdaPIECE);

		// get flags
		flags = unpackFlags(PIECE.flags);

		// print PIECE data
		console.log(`# ${countPIECE[0]}\t| PIECE ID: ----> ${PIECE.pieceslug}`);
		console.log(`\t| BALANCE: -----> ${PIECE.balance}`);
		console.log(`\t| NETSUM: ------> ${PIECE.netsum}`);
		process.stdout.write(`\t| FLAGS: -------> `);
		process.stdout.write(`[ `);
		for (var index = 0; index < 4; index++) {
			process.stdout.write(`${flags[index]} `);
		}
		process.stdout.write(`| `);
		for (var index = 4; index < 8; index++) {
			process.stdout.write(`${flags[index]} `);
		}
		process.stdout.write(`| `);
		for (var index = 8; index < 12; index++) {
			process.stdout.write(`${flags[index]} `);
		}
		process.stdout.write(`| `);
		for (var index = 12; index < 16; index++) {
			process.stdout.write(`${flags[index]} `);
		}
		process.stdout.write(`]`);
		process.stdout.write(`\n\n`);

		
		// print operator refs
		await verboseREFlist(pdaPIECE, PIECE.refcount);

	}

	} catch {
		console.log(Error);
	}
};

TreePIECEverbose();



