import * as BufferLayout from "buffer-layout";
import * as fs from "fs";
//import fs from "mz/fs";
import os from "os";
import path from "path";
import yaml from "yaml";
import read from "read";
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
const BigNumber = require("bignumber.js");

import {
	establishConnection,
	establishPayer,
	checkProgram,
	getProgramID,
	getKeypair,
	toUTF8Array,
} from "./utils";

import {
	fracpayID,
	connection,
	payer,
	MAIN_DATA_LAYOUT,
	MAINlayout,
	PIECE_DATA_LAYOUT,
	PIECElayout,
} from "./utils";

require("trace");
const Base58 = require("base-58");
Error.stackTraceLimit = 50;

/**
 * main
 **/

const InitPIECE = async () => {
	
	try {
	
	// get preliminary info
	const operatorKEY = getKeypair("operator");
	const operatorID = "I AM AN OPERATOR ID"
	var PIECEslug = "I AM A NEW PIECE ID";
	var countPIECE = new Uint16Array(1);
	countPIECE[0] = 0;
	var countREF = new Uint16Array(1);
	countREF[0] = 0;


	// setup
	await establishConnection();
	await establishPayer();
	await checkProgram();

	// get main account data

	// find MAIN address
	let [pdaMAIN, bumpMAIN] = await PublicKey.findProgramAddress(
		[new Uint8Array(toUTF8Array(operatorID))], fracpayID);
	console.log(`. MAIN pda:\t\t${pdaMAIN.toBase58()} found after ${256 - bumpMAIN} tries`);

	const MAINaccount = await connection.getAccountInfo(pdaMAIN);

	console.log(MAINaccount.data);

	if (MAINaccount === null || MAINaccount.data.length === 0) {
		console.log("! MAIN pda account has not been initialized properly");
		process.exit(1);
	}
	
	// find PIECE address
	//
	// create PIECE pda seed	
	let countPIECElow = countPIECE[0] & 0xFF; // mask for low order count byte
	let countPIECEhigh = (countPIECE[0] >> 8) & 0xFF; // shift and mask for high order count byte
	var pdaPIECEseed = toUTF8Array(pdaMAIN.toString().slice(0,30)).concat(countPIECEhigh, countPIECElow);	

	let [pdaPIECE, bumpPIECE] = await PublicKey.findProgramAddress(
		[new Uint8Array(pdaPIECEseed)], fracpayID);
	console.log(`. MAIN pda:\t\t${pdaPIECE.toBase58()} found after ${256 - bumpPIECE} tries`);

	const PIECEaccount = await connection.getAccountInfo(pdaPIECE);

	console.log(PIECEaccount.data);

	if (PIECEaccount === null || PIECEaccount.data.length === 0) {
		console.log("! MAIN pda account has not been initialized properly");
		process.exit(1);
	}


	// set MAIN struct from get acct info
	const encodedMAINstate = MAINaccount.data;
	const decodedMAINstate = MAIN_DATA_LAYOUT.decode(encodedMAINstate) as MAINlayout;
	var MAIN = {
		flags: decodedMAINstate.flags,
		operator: new PublicKey(decodedMAINstate.operator),
		balance: new BigNumber("0x" + decodedMAINstate.balance.toString("hex")),
		netsum: new BigNumber("0x" + decodedMAINstate.netsum.toString("hex")),
		piececount: decodedMAINstate.piececount,
	}
	
	// set PIECE struct from get acct info
	const encodedPIECEstate = PIECEaccount.data;
	const decodedPIECEstate = PIECE_DATA_LAYOUT.decode(encodedPIECEstate) as PIECElayout;
	var PIECE = {
		flags: decodedPIECEstate.flags,
		operator: new PublicKey(decodedPIECEstate.operator),
		balance: new BigNumber("0x" + decodedPIECEstate.balance.toString("hex")),
		netsum: new BigNumber("0x" + decodedPIECEstate.netsum.toString("hex")),
		refcount: decodedPIECEstate.refcount,
		pieceslug: decodedPIECEstate.pieceslug.toString(),
	}
	console.log(PIECE.flags);
	console.log(PIECE.refcount);
	console.log(PIECE.netsum)
	console.log(PIECE.balance);
	console.log(PIECE.operator);
	console.log(payer.publicKey);
	console.log(PIECE.pieceslug);

/*
	const MAIN.balance = MAIN.balance.readUInt32LE(0); // need to figure out get u64 from this
	const MAIN.netsum = MAIN.netsum.readUInt32LE(0); // need to figure out get u64 from this


	console.log(flagsMAIN);
	console.log(operatorMAIN);
	console.log(balanceMAIN);
	console.log(netsumMAIN);
	console.log(countMAIN);
*/
/*
	// (just discovered that seed is limited to 32 bytes)
	// create PIECE pda seed	
	let countPIECElow = countPIECE[0] & 0xFF; // mask for low order count byte
	let countPIECEhigh = (countPIECE[0] >> 8) & 0xFF; // shift and mask for high order count byte
	var pdaPIECEseed = toUTF8Array(pdaMAIN.toString().slice(0,30)).concat(countPIECEhigh, countPIECElow);

	console.log(toUTF8Array(operatorID));
	// find PIECE address
	let [pdaPIECE, bumpPIECE] = await PublicKey.findProgramAddress(
		[new Uint8Array(pdaPIECEseed)], fracpayID);
	console.log(`. Self PIECE pda:\t${pdaPIECE.toBase58()} found after ${256 - bumpPIECE} tries`);
/*
	// create REF pda seed
	let countREFlow = countREF[0] & 0xFF;	// mask for low order count byte
	let countREFhigh = (countREF[0] >> 8) & 0xFF;	// shift and mask for high order count byte
	var pdaREFseed = toUTF8Array(pdaPIECE.toString().slice(0,30)).concat(countREFhigh, countREFlow);

	// find REF address
	let [pdaREF, bumpREF] = await PublicKey.findProgramAddress(
		[Buffer.from(new Uint8Array(pdaREFseed))], fracpayID);
	console.log(`. Self REF pda:\t\t${pdaREF.toBase58()} found after ${256 - bumpREF} tries`);
*/
	// check payfract for MAINPDA
		// 1) get payfract accounts with flag bits 1 & 2 low
		// 2) compare resulting object against MAINPDA
	
	// no preexisting MAINPDA, so create account
	//
	// add some data sizes
	// MAIN:
/*
	var ixDATA = [1, bumpMAIN, bumpPIECE, bumpREF]
		.concat(pdaREFseed)
		.concat(pdaPIECEseed)
		.concat(toUTF8Array(operatorID));
	console.log(ixDATA);

	let InitMAINtx = new Transaction().add(
		new TransactionInstruction({
			keys: [
				{ pubkey: payer.publicKey, isSigner: true, isWritable: true, },
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
       
console.log(`txhash: ${await sendAndConfirmTransaction(connection, InitMAINtx, [payer], )}`);
*/

	} catch {
		console.log(Error);
		console.log(Error.prototype.stack);
	}
};

InitPIECE();
