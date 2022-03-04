/****************************************************************
 * Fracpay client InitMAIN					*	
 * blairmunroakusa@.0322.anch.AK				*
 *								*
 * InitMAIN creates a new operator.				*
 * One each of MAIN, self PIECE, self REF accounts are created.	*
 ****************************************************************/

/****************************************************************
 * imports							*
 ****************************************************************/

import * as BufferLayout from "buffer-layout";
//import * as fs from "fs";
import * as fs from "mz/fs";
import * as os from "os";
import * as path from "path";
import * as yaml from "yaml";
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
import BN = require("bn.js");
import * as bs58 from "bs58";



import {
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
	operator,
	MAIN_SIZE,
	PIECE_SIZE,
	FLAGS_SIZE,
	PUBKEY_SIZE,
	BALANCE_SIZE,
	NETSUM_SIZE,
	COUNT_SIZE,
	PIECESLUG_SIZE,
} from "./utils";

require("trace");
const Base58 = require("base-58");
Error.stackTraceLimit = Infinity;

/****************************************************************
 * main								*
 ****************************************************************/

const InitMAIN = async () => {
	
	try {
	
	// get preliminary info
	const operatorKEY = getKeypair("operator"); // operator ID must be less than 32 bytes
	var operatorID = "I AM AN OPERATOR ID";
	var countPIECE = new Uint16Array(1)
	countPIECE[0] = 0;
	var countREF = new Uint16Array(1);
	countREF[0] = 0;

	// setup
	await establishConnection();
	await establishOperator();
	await checkProgram();

	// find MAIN address
	let [pdaMAIN, bumpMAIN] = await PublicKey.findProgramAddress(
		[new Uint8Array(toUTF8Array(operatorID))], fracpayID);
	console.log(`. MAIN pda:\t\t${pdaMAIN.toBase58()} found after ${256 - bumpMAIN} tries`);

	// create PIECE pda seed, limited to 32 bytes	
	let countPIECElow = countPIECE[0] & 0xFF; 		// mask for low order count byte
	let countPIECEhigh = (countPIECE[0] >> 8) & 0xFF; 	// shift and mask for high order count byte
	var pdaPIECEseed = toUTF8Array(pdaMAIN
				       .toString()
				       .slice(0,PUBKEY_SIZE - FLAGS_SIZE))
				       .concat(countPIECEhigh, countPIECElow);

	// find PIECE address
	let [pdaPIECE, bumpPIECE] = await PublicKey.findProgramAddress(
		[new Uint8Array(pdaPIECEseed)], fracpayID);
	console.log(`. Self PIECE pda:\t${pdaPIECE.toBase58()} found after ${256 - bumpPIECE} tries`);

	// create REF pda seed
	let countREFlow = countREF[0] & 0xFF;
	let countREFhigh = (countREF[0] >> 8) & 0xFF;
	var pdaREFseed = toUTF8Array(pdaPIECE
				     .toString()
				     .slice(0,30))
				     .concat(countREFhigh, countREFlow);

	// find REF address
	let [pdaREF, bumpREF] = await PublicKey.findProgramAddress(
		[Buffer.from(new Uint8Array(pdaREFseed))], fracpayID);
	console.log(`. Self REF pda:\t\t${pdaREF.toBase58()} found after ${256 - bumpREF} tries`);

	// check payfract for pdaMAIN associated with operatorID
	const operatorIDcheck = await connection.getParsedProgramAccounts(
		fracpayID,
		{
			filters: [
				{
					dataSize: PIECE_SIZE,
				},
				{
					memcmp: {
						offset: PIECE_SIZE - PIECESLUG_SIZE,
						bytes: bs58.encode(toUTF8Array(operatorID)),
					},
				},
			],
		},
	);
	if (operatorIDcheck) {
		console.log(`! The operator ID '${operatorID}' already has an account associated with it.\n`,
			    ` Choose a different ID for your operator account.`,
		);
		process.exit(1);
	}
	
	// setup instruction data
	var ixDATA = [0, bumpMAIN, bumpPIECE, bumpREF]
		.concat(pdaREFseed)
		.concat(pdaPIECEseed)
		.concat(toUTF8Array(operatorID));

	// setup transaction
	let InitMAINtx = new Transaction().add(
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
	console.log(`txhash: ${await sendAndConfirmTransaction(connection, InitMAINtx, [operator], )}`);

	} catch {

	console.log(Error);

	}
};

InitMAIN();

