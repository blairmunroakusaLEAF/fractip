//import * as BufferLayout from "buffer-layout";
//import * as fs from "fs";
import fs from "mz/fs";
import os from "os";
import path from "path";
import yaml from "yaml";
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
} from "./utils";

require("trace");
const Base58 = require("base-58");
Error.stackTraceLimit = 50;

/**
 * main
 **/

const InitMAIN = async () => {
	
	try {
	
	// get preliminary info
	const operatorKEY = getKeypair("operator");
	var operatorID = "EEEEEEEE";
	var noPIECE = new Uint16Array(1)
	noPIECE[0] = 0;
	var noREF = new Uint16Array(1);
	noREF[0] = 0;

	// setup
	await establishConnection();
	await establishPayer();
	await checkProgram();

	// find MAIN address
	let [pdaMAIN, bumpMAIN] = await PublicKey.findProgramAddress(
		[new Uint8Array(toUTF8Array(operatorID))], fracpayID);
	console.log(`. MAIN pda:\t\t${pdaMAIN.toBase58()} found after ${256 - bumpMAIN} tries`);

	// (just discovered that seed is limited to 32 bytes)
	// create PIECE pda seed	
	let noPIECElow = noPIECE[0] & 0xFF; // mask for low order count byte
	let noPIECEhigh = (noPIECE[0] >> 8) & 0xFF; // shift and mask for high order count byte
	var pdaPIECEseed = toUTF8Array(pdaMAIN.toString().slice(0,30)).concat(noPIECEhigh, noPIECElow);

	console.log(toUTF8Array(operatorID));
	// find PIECE address
	let [pdaPIECE, bumpPIECE] = await PublicKey.findProgramAddress(
		[new Uint8Array(pdaPIECEseed)], fracpayID);
	console.log(`. Self PIECE pda:\t${pdaPIECE.toBase58()} found after ${256 - bumpPIECE} tries`);

	// create REF pda seed
	let noREFlow = noREF[0] & 0xFF;	// mask for low order count byte
	let noREFhigh = (noREF[0] >> 8) & 0xFF;	// shift and mask for high order count byte
	var pdaREFseed = toUTF8Array(pdaPIECE.toString().slice(0,30)).concat(noREFhigh, noREFlow);

	// find REF address
	let [pdaREF, bumpREF] = await PublicKey.findProgramAddress(
		[Buffer.from(new Uint8Array(pdaREFseed))], fracpayID);
	console.log(`. Self REF pda:\t\t${pdaREF.toBase58()} found after ${256 - bumpREF} tries`);

	// check payfract for MAINPDA
		// 1) get payfract accounts with flag bits 1 & 2 low
		// 2) compare resulting object against MAINPDA
	
	// no preexisting MAINPDA, so create account
	//
	// add some data sizes
	// MAIN:

	var ixDATA = [0, bumpMAIN, bumpPIECE, bumpREF]
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


	} catch {
		console.log(Error);
		console.log(Error.prototype.stack);
	}
};

InitMAIN();

// setup layouts and interface
//

/**
 * uint8, uint16, uint32 is already taken care of in Layout Module buffer-layout
 **/

/**
 * flags layout
 **//*
const flags = (property = "flags") => {
	return BufferLayout.blob(2, property);
};

/**
 * public key layout
 **//*
const publicKey = (property = "publicKey") => {
	return BufferLayout.blob(32, property);
};

/**
 * pieceID layout
 **//*
const pieceSlug = (property = "pieceSlug") => {
	return BufferLayout.blob(68, property);
};	// 64B String with 4B Vec tag

/**
 * refSlug layout
 **//*
const refSlug = (property = "refSlug") => {
	return BufferLayout.blob(20, property);
};	// 16B String with 4B Vec tag

/**
 * u64 layout
 **//*
const uint64 = (property = "uint64") => {
  return BufferLayout.blob(8, property);
};

		
interface MAINlayout {
	flags: number;
	operator: Uint8Array;
	balance: Uint8Array;
	netsum: Uint8Array;
	piececount: number;
}

/**
 * account struct PIECE
 **//*
const PIECE_DATA_LAYOUT = BufferLayout.struct([
	BufferLayout.u8("flags"),
	publicKey("operator"),
	uint64("balance"),
	uint64("netsum"),
	BufferLayout.u32("refcount"),
	pieceSlug("pieceslug"),
]);
interface PIECElayout {
	flags: number;
       	operator: Uint8Array;
	balance: Uint8Array;
	netsum: Uint8Array;
	refcount: number;
	pieceslug: Uint8Array;
}

/**
 * account struct REF
 **//*
const REF_DATA_LAYOUT = BufferLayout.struct([
	BufferLayout.u8("flags"),
	publicKey("target"),
	BufferLayout.u32("fract"),
	uint64("netsum"),
	refSlug("refslug"),
]);
interface REFlayout {
	flags: number;
       	target: Uint8Array;
	fract: number;
	netsum: Uint8Array;
	refslug: Uint8Array;
};


