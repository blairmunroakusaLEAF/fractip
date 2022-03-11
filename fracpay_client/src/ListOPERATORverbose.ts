/****************************************************************
 * Fracpay client ListOPERATORverbose
 * blairmunroakusa@.0322.anch.AK
 *			
 * Lists all accounts under a specific operator wallet.	
 * Pieces are listed numbered to make CLI piece selection easy.	
 ****************************************************************/

/****************************************************************
 * imports							
 ****************************************************************/

const prompt = require("prompt-sync")({sigint: true});

import {
	operatorKEY,
	getPIECEs,
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
 * main								
 ****************************************************************/

const ListMAINverbose = async () => {
	
	try {
	
	// setup
	await establishConnection();
	await establishOperator();
	await checkProgram();

	// get PIECE accounts with operator Key in operator field
	const PIECEs = await getPIECEs(operatorKEY.publicKey);

	console.log(PIECEs.length);
	console.log(PIECEs);

	// state intention
	console.log(`PIECE tree:\n`);
	

	// cycle through all pieces
	for (var countPIECE = 1; countPIECE <= PIECEs.length; countPIECE++) {

		// get PIECE data
		var PIECE = await getPIECEdata(PIECEs[countPIECE].pubkey);

		// get flags
		var flags = unpackFlags(PIECE.flags);

		// print PIECE data
		console.log(`# ${countPIECE}\t| PIECE ID: ----> ${PIECE.pieceslug}`);
		console.log(`\t| ADDRESS: -----> ${PIECE.operator}`);
		console.log(`\t| OPERATOR: ----> ${PIECE.operator}`);
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
		await verboseREFlist(PIECEs[countPIECE].pubkey, PIECE.refcount);

	}

	} catch {
		console.log(Error);
	}
};

ListMAINverbose();



