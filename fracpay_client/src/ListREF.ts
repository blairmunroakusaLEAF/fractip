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
	unpackFlags,
	printPIECElist,
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

const ListREF = async () => {
	
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
	
	// print PIECE list
	await printPIECElist(pdaMAIN, MAIN.piececount);

	// get PIECE selection
	var selectPIECE = new Uint16Array(1);
	selectPIECE[0] = parseInt(prompt("From the PIECE list, please enter # to list REFs for: "));

	// check PIECE selection input
	if (selectPIECE[0] < 0 || selectPIECE[0] > MAIN.piececount) {
		console.log(`! You made an invalid selection. Type in a number, nothing else.`);
		process.exit(1);
	}
	// get selected PIECE data
	const pdaPIECEseed = createSeed(pdaMAIN, selectPIECE);
	const [pdaPIECE, bumpPIECE] = await deriveAddress(pdaPIECEseed);
	var PIECE = await getPIECEdata(pdaPIECE);

	// state intention
	console.log(`. Listing ${PIECE.refcount} REFs associated with '${PIECE.pieceslug}' PIECE account.\n`,
		    `\nREF\n`);

	// initialize ref counter
	var countREF = new Uint16Array(1);
	countREF[0] = 0;

	// find self REF address
	var pdaREFseed = createSeed(pdaPIECE, countREF);
	var [pdaREF, bumpREF] = await deriveAddress(pdaREFseed);

	// get self PIECE data
	var REF = await getREFdata(pdaREF);

	// get flags
	var flags = unpackFlags(REF.flags);

	// print self PIECE data
	console.log(`# 0\tSELF:\t\t${REF.refslug}\n`,
		    `\tFRACTION:\t${REF.fract/1000000}\n`,
		    `\tNETSUM:\t\t${REF.netsum}`);
	process.stdout.write(`\tFLAGS:\t\t`);
	for (var index = 0; index < 16; index++) {
		process.stdout.write(`${flags[index]}  `);
	}
	process.stdout.write(`\n\n`);
	
	// cycle through all pieces
	for (countREF[0] = 1; countREF[0] <= PIECE.refcount; countREF[0]++) {

		// find REF address
		pdaREFseed = createSeed(pdaPIECE, countREF);
		[pdaREF, bumpREF] = await deriveAddress(pdaREFseed);

		// get REF data
		REF = await getREFdata(pdaREF);
		
		// get flags
		var flags = unpackFlags(REF.flags);

		// print REF data
		console.log(`# ${countREF[0]}\tREF ID:\t\t${REF.refslug}\n`,
			    `\tFRACTION:\t${REF.fract/1000000}\n`,
			    `\tNETSUM:\t\t${REF.netsum}`);
		process.stdout.write(`\tFLAGS:\t\t`);
		for (var index = 0; index < 16; index++) {
			process.stdout.write(`${flags[index]}  `);
		}
		process.stdout.write(`\n\n`);

	}

	} catch {
		console.log(Error);
	}
};

ListREF();


