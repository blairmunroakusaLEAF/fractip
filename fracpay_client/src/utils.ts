/****************************************************************
 * Fracpay client utility blob					*	
 * blairmunroakusa@.0322.anch.AK				*
 ****************************************************************/

/****************************************************************
 * imports							*
 ****************************************************************/

import {
  Keypair,
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  SYSVAR_RENT_PUBKEY,
  SystemProgram,
  TransactionInstruction,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

import * as os from "os";
import * as fs from "mz/fs";
import * as path from "path";
import * as yaml from "yaml";
import * as BufferLayout from "buffer-layout";
const BigNumber = require("bignumber.js");
const bs58 = require("bs58");
const lodash = require("lodash");
const crypto = require('crypto-js');


/****************************************************************
 * declare constants						*
 ****************************************************************/

export const FLAGS_SIZE = 2;
export const PUBKEY_SIZE = 32;
export const BALANCE_SIZE = 8;
export const NETSUM_SIZE = 8;
export const COUNT_SIZE = 2;
export const FRACT_SIZE = 4;
export const PIECESLUG_SIZE = 67; 	// 63 + 4
export const REFSLUG_SIZE = 20;		// 16 + 4

export const MAIN_SIZE = FLAGS_SIZE +
			PUBKEY_SIZE +
		  	BALANCE_SIZE +
		  	NETSUM_SIZE +
		  	COUNT_SIZE;		// = 52

export const PIECE_SIZE = FLAGS_SIZE +
		  	PUBKEY_SIZE +
		  	BALANCE_SIZE +
		  	NETSUM_SIZE +
		  	COUNT_SIZE +
		  	PIECESLUG_SIZE;		// = 119

export const REF_SIZE = FLAGS_SIZE +
		  	PUBKEY_SIZE +
		  	NETSUM_SIZE +
		  	FRACT_SIZE +
		  	REFSLUG_SIZE;		// = 66
export const MAX_FRACT = 100_000_000;

export let connection: Connection;
export let operatorKEY: Keypair;
export let fracpayID: PublicKey;

export const PROGRAM_KEYFILE = "fracpay_server-keypair.json";
export const PROGRAM_PATH = path.resolve(
	"/Users/blairmunroakusa/_ROOT/___LEAF/fracpay/fracpay_server/target/deploy"
);
export const PROGRAM_KEYPAIR_PATH = path.join(PROGRAM_PATH, PROGRAM_KEYFILE);

/****************************************************************
 * general functions						*
 ****************************************************************/



/**
* check initialization flag
**/

export function initFlagCheck(flags: number) {
	const flagarray = unpackFlags(flags);
	return flagarray[4] === 1;
}

/**
* create keyhash
**/

export function newKeyhash() {
	const newkey = new Keypair();
	var keyhash = crypto.SHA256(newkey.publicKey.toString());
	keyhash = bs58.encode(Buffer.from(keyhash.toString(), 'hex'));
	keyhash = new PublicKey(keyhash);
	return [newkey.publicKey, keyhash];
}

/**
* general init transaction
**/

export function initTX(
	pdaMAIN: PublicKey,
	pdaPIECE: PublicKey,
	pdaREF: PublicKey,
	pdaselfREF: PublicKey,
	invitarget: PublicKey,
	ixDATA: any[]) {

	// setup transaction
	return new Transaction().add(
		new TransactionInstruction({
			keys: [
				{ pubkey: operatorKEY.publicKey, isSigner: true, isWritable: true, },
				{ pubkey: invitarget, isSigner: false, isWritable: true, },
				{ pubkey: pdaMAIN, isSigner: false, isWritable: true, },
				{ pubkey: pdaPIECE, isSigner: false, isWritable: true, },
				{ pubkey: pdaREF, isSigner: false, isWritable: true, },
				{ pubkey: pdaselfREF, isSigner: false, isWritable: true, },
				{ pubkey: SystemProgram.programId, isSigner: false, isWritable: false, },
			],
			data: Buffer.from(new Uint8Array(ixDATA)),
			programId: fracpayID,
		})
	);
}


/**
* general create transaction
**/

export function createTX(
	pdaMAIN: PublicKey,
	pdaPIECE: PublicKey,
	pdaREF: PublicKey,
	ixDATA: any[]) {

	// setup transaction
	return new Transaction().add(
		new TransactionInstruction({
			keys: [
				{ pubkey: operatorKEY.publicKey, isSigner: true, isWritable: true, },
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
}

/**
* print verbose REF list, no flags
**/
export async function verboseREFlist(pdaPIECE: PublicKey, count: number) {

	// initialize piece counter
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
	console.log(`\t. 0\t| SELF: --------> ${REF.refslug}`);
	console.log(`\t\t| TARGET: ------> ${REF.target.toBase58()}`);
	console.log(`\t\t| FRACTION: ----> ${REF.fract}`);
	console.log(`\t\t| NETSUM: ------> ${REF.netsum}`);
	process.stdout.write(`\t\t| FLAGS: -------> `);
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

	// cycle through all pieces
	for (countREF[0] = 1; countREF[0] <= count; countREF[0]++) {

		// find PIECE address
		pdaREFseed = createSeed(pdaPIECE, countREF);
		[pdaREF, bumpREF] = await deriveAddress(pdaREFseed);

		// get PIECE data
		REF = await getREFdata(pdaREF);

		// get flags
		flags = unpackFlags(REF.flags);

		// print PIECE data
		console.log(`\t. ${countREF[0]}\t| REF ID: ------> ${REF.refslug}`);
		console.log(`\t\t| TARGET: ------> ${REF.target.toBase58()}`);
		console.log(`\t\t| FRACTION: ----> ${REF.fract}`);
		console.log(`\t\t| NETSUM: ------> ${REF.netsum}`);
		process.stdout.write(`\t\t| FLAGS: -------> `);
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
	}	
}

/**
* print REF list
**/
export async function printREFlist(pdaPIECE: PublicKey, count: number) {

	// initialize piece counter
	var countREF = new Uint16Array(1);
	countREF[0] = 0;

	// find self REF address
	var pdaREFseed = createSeed(pdaPIECE, countREF);
	var [pdaREF, bumpREF] = await deriveAddress(pdaREFseed);

	// get self PIECE data
	var REF = await getREFdata(pdaREF);

	// print self PIECE data
	console.log(`\t. 0\tSELF:\t${REF.refslug}`);

	// cycle through all pieces
	for (countREF[0] = 1; countREF[0] <= count; countREF[0]++) {

		// find PIECE address
		pdaREFseed = createSeed(pdaPIECE, countREF);
		[pdaREF, bumpREF] = await deriveAddress(pdaREFseed);

		// get PIECE data
		REF = await getREFdata(pdaREF);

		// print PIECE data
		console.log(`\t. ${countREF[0]}\tREF ID:\t${REF.refslug}`);
	}	
	console.log("");
}

/**
* get PIECE list
**/
export async function printPIECElist(pdaMAIN: PublicKey, count: number) {

	// initialize piece counter
	var countPIECE = new Uint16Array(1);
	countPIECE[0] = 0;

	// find self PIECE address
	var pdaPIECEseed = createSeed(pdaMAIN, countPIECE);
	var [pdaPIECE, bumpPIECE] = await deriveAddress(pdaPIECEseed);

	// get self PIECE data
	var PIECE = await getPIECEdata(pdaPIECE);

	// print self PIECE data
	console.log(`# 0\tOPERATOR:\t${PIECE.pieceslug}`);

	// cycle through all pieces
	for (countPIECE[0] = 1; countPIECE[0] <= count; countPIECE[0]++) {

		// find PIECE address
		pdaPIECEseed = createSeed(pdaMAIN, countPIECE);
		[pdaPIECE, bumpPIECE] = await deriveAddress(pdaPIECEseed);

		// get PIECE data
		PIECE = await getPIECEdata(pdaPIECE);

		// print PIECE data
		console.log(`# ${countPIECE[0]}\tPIECE ID:\t${PIECE.pieceslug}`);
	}	
}

/**
* get MAIN account data
**/
export async function getMAINdata(pdaMAIN: PublicKey) {
	// get MAIN account data
	const MAINaccount = await connection.getAccountInfo(pdaMAIN);
	if (MAINaccount === null || MAINaccount.data.length === 0) {
		console.log(`! MAIN account for this operator ID has not been created.`);
		process.exit(1);
	}

	// build MAIN struct
	const encodedMAINstate = MAINaccount.data;
	const decodedMAINstate = MAIN_DATA_LAYOUT.decode(encodedMAINstate) as MAINlayout;
	return {
		flags: decodedMAINstate.flags,
		operator: new PublicKey(decodedMAINstate.operator),
		balance: new BigNumber("0x" + decodedMAINstate.balance.toString("hex")),
		netsum: new BigNumber("0x" + decodedMAINstate.netsum.toString("hex")),
		piececount: decodedMAINstate.piececount,
	}
}
/**
* get PIECE account data
**/
export async function getPIECEdata(pdaPIECE: PublicKey) {
	// get PIECE account data
	const PIECEaccount = await connection.getAccountInfo(pdaPIECE);
	if (PIECEaccount === null || PIECEaccount.data.length === 0) {
		console.log(`! This PIECE account has not been created.`);
		process.exit(1);
	}

	// build PIECE struct
	const encodedPIECEstate = PIECEaccount.data;
	const decodedPIECEstate = PIECE_DATA_LAYOUT.decode(encodedPIECEstate) as PIECElayout;
	return {
		flags: decodedPIECEstate.flags,
		operator: new PublicKey(decodedPIECEstate.operator),
		balance: new BigNumber("0x" + decodedPIECEstate.balance.toString("hex")),
		netsum: new BigNumber("0x" + decodedPIECEstate.netsum.toString("hex")),
		refcount: decodedPIECEstate.refcount,
		pieceslug: decodedPIECEstate.pieceslug.toString(),

	}
}
/**
* get REF account data
**/
export async function getREFdata(pdaREF: PublicKey) {
	// get REF account data
	const REFaccount = await connection.getAccountInfo(pdaREF);
	if (REFaccount === null || REFaccount.data.length === 0) {
		console.log(`! This REF account has not been created.`);
		process.exit(1);
	}

	// build MAIN struct
	const encodedREFstate = REFaccount.data;
	const decodedREFstate = REF_DATA_LAYOUT.decode(encodedREFstate) as REFlayout;
	return {
		flags: decodedREFstate.flags,
		target: new PublicKey(decodedREFstate.target),
		fract: decodedREFstate.fract,
		netsum: new BigNumber("0x" + decodedREFstate.netsum.toString("hex")),
		refslug: decodedREFstate.refslug.toString(),

	}
}

/**
* unpack flags
**/
export function unpackFlags(flags: number) {
	const highflags = flags >> 8;
	const lowflags = flags & 0xFF;
	var bitarray = new Uint8Array(16);
	for (var index = 0; index < 8; index++) {
		bitarray[index] = (highflags >> (7 - index)) & 0x01;
	}
	for (index = 0; index < 8; index++) {
		bitarray[8 + index] = (lowflags >> (7 - index)) & 0x01;
	}
	return bitarray
}

/**
* create pda seed
**/
export function createSeed(pda: PublicKey, count: Uint16Array) {
	let countLow = count[0] & 0xFF; 		// mask for low order count byte
	let countHigh = (count[0] >> 8) & 0xFF; 	// shift and mask for high order count byte
	return toUTF8Array(pda
			   .toString()
			   .slice(0,PUBKEY_SIZE - COUNT_SIZE))
			   .concat(countHigh, countLow);
}

/**
* u32 to bytes
**/
export function u32toBytes(number: Uint32Array) {
	let byte1 = number[0] & 0xFF; 		// mask for lowest order number byte
	let byte2 = (number[0] >> 8) & 0xFF; 	// shift and mask for next lowest order number byte
	let byte3 = (number[0] >> 16) & 0xFF; 	// shift and mask for high order number byte
	let byte4 = (number[0] >> 24) & 0xFF; 	// shift and mask for highest order number byte
	return [byte4, byte3, byte2, byte1];
}

/**
* derive pda
**/
export async function deriveAddress(seed: any[]) {
	return await PublicKey.findProgramAddress(
		[new Uint8Array(seed)], fracpayID);
}

/**
* check to make sure operator ID isn't already taken
**/
export async function availableIDcheck(operatorID: string): Promise<void> {
	const operatorIDaccount = await connection.getParsedProgramAccounts(
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
	if (!lodash.isEqual(operatorIDaccount, [])) {
		console.log(`! The operator ID '${operatorID}' already has a MAIN account associated with it.\n`,
			    ` Choose a different ID for your operator MAIN account.`,
		);
		process.exit(1);
	}
}

/**
* get all PIECEs with specific MAIN operator account
***/
export async function getPIECEs(operator: PublicKey) {
	console.log("chirp");
	return await connection.getParsedProgramAccounts(
		fracpayID,
		{
			filters: [
				{
					dataSize: PIECE_SIZE,
				},
				{
					memcmp: {
						offset: FLAGS_SIZE,
						bytes: operator.toString(),
					},
				},
			],
		},
	);
}

/**
* Check if the hello world BPF program has been deployed
**/
export async function checkProgram(): Promise<void> {
	// Read program id from keypair file
	try {
		const programKeypair = await createKeypairFromFile(PROGRAM_KEYPAIR_PATH);
		fracpayID = programKeypair.publicKey;
		console.log(`. Fracpay found at:\t${fracpayID.toBase58()}`);
	} catch (err) {
		const errMsg = (err as Error).message;
		throw new Error(
			`! Failed to read program keypair at "${PROGRAM_KEYPAIR_PATH}" due to error: ${errMsg}.\n
			Program may need to be deployed with 
			\`solana program deploy fracpay_server/target/deploy/fracpay_server.so\``,
		);
	}
}

/**
 * establish connection
 **/
export async function establishConnection(): Promise<void> {
	const rpcUrl = await getRpcUrl();
  	connection = new Connection(rpcUrl, "confirmed");
  	const version = await connection.getVersion();
  	console.log(". Connection to cluster established:", rpcUrl, version);
}

async function getRpcUrl(): Promise<string> {
  	try {
    		const config = await getConfig();
    		if (!config.json_rpc_url) throw new Error("Missing RPC URL");
    		return config.json_rpc_url;
 	 } catch (err) {
    		console.warn(
      			"! Failed to read RPC url from CLI config file, falling back to localhost",
    		);
    		return "http://localhost:8899";
  	}
}

/**
 * get operator's local solana config
 **/
async function getConfig(): Promise<any> {
  	// Path to Solana CLI config file
  	const CONFIG_FILE_PATH = path.resolve(
    		os.homedir(),
    		".config",
    		"solana",
    		"cli",
    		"config.yml",
  	);
  	const configYml = await fs.readFile(CONFIG_FILE_PATH, {encoding: "utf8"});
  	return yaml.parse(configYml);
}

/**
 * establish operator
 **/
export async function establishOperator(): Promise<void> {
  	let fees = 0;
  	if (!operatorKEY) {
    		const {feeCalculator} = await connection.getRecentBlockhash();

 		// Calculate the cost to fund the greeter account
    		fees += await connection.getMinimumBalanceForRentExemption(MAIN_SIZE + PIECE_SIZE + REF_SIZE);

    		// Calculate the cost of sending transactions
    		fees += feeCalculator.lamportsPerSignature * 100; // wag

    		operatorKEY = await getOperator();
  	}

  	let lamports = await connection.getBalance(operatorKEY.publicKey);
  	if (lamports < fees) {

    		// If current balance is not enough to pay for fees, request an airdrop
    		console.log(
			`! Unfortunately you do not have enough SOL to initialize an account.\n`,
			`  You need ${fees/LAMPORTS_PER_SOL} SOL to initialize account.`,
		)
  	}

  	console.log(
    		". Operator account is:\t",
    		operatorKEY.publicKey.toBase58(),
    		"containing",
    		lamports / LAMPORTS_PER_SOL,
    		"SOL to pay for fees",
  	);
}

/**
 * setup operatorKEY as Keypair
 **/
async function getOperator(): Promise<Keypair> {
  	try {
    		const config = await getConfig();
    		if (!config.keypair_path) throw new Error("Missing keypair path");
    		return await createKeypairFromFile(config.keypair_path);
  	} catch (err) {
    		console.warn(
      			"! Failed to create keypair from CLI config file, falling back to new random keypair",
    		);
    		return Keypair.generate();
 	 }
}

/**
 * read secret key from file and return Keypair object
 **/
async function createKeypairFromFile(filePath: string,): Promise<Keypair> {
  	const secretKeyString = await fs.readFile(filePath, {encoding: "utf8"});
 	const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
  	return Keypair.fromSecretKey(secretKey);
}

/**
 * return private key from 64 byte array in file
 **/
const getPrivateKey = (name: string) =>
	Uint8Array.from(
		JSON.parse(fs.readFileSync(`./keys/${name}_pri.json`) as unknown as string)
	);

/**
 * return public key from base58 formatted string in file
 **/
const getPublicKey = (name: string) =>
	new PublicKey(
		JSON.parse(fs.readFileSync(`./keys/${name}_pub.json`) as unknown as string)
 	);

/**
 * write a public key to file [presumably hex string, haven't checked yet]
 **/
const writePublicKey = (publicKey: PublicKey, name: string) => {
	fs.writeFileSync(
		`./keys/${name}_pub.json`,
		JSON.stringify(publicKey.toString())
	);
};

/**
 * creates Keypair object from named pubkey prikey json files
 **/
export const getKeypair = (name: string) =>
	new Keypair({
		publicKey: new Uint8Array(getPublicKey(name).toBytes()),
		secretKey: getPrivateKey(name),
	});
/**
 * read fracpay program ID from json file in keys directory
 **/
export const getProgramID = () => {
	try {
		return getPublicKey("fracpay");
	} catch (error) {
		console.log("Given programId is missing or incorrect");
	process.exit(1);
	}
};

/**
 * take in a UTF8 array and turn it into a string
 **/
export function fromUTF8Array(data: Uint8Array) { // array of bytes
    	var str = "";
    	var i;

    	for (i = 0; i < data.length; i++) {
        	var value = data[i];

        	if (value < 0x80) {
            		str += String.fromCharCode(value);
       		} else if (value > 0xBF && value < 0xE0) {
            		str += String.fromCharCode((value & 0x1F) << 6 | data[i + 1] & 0x3F);
            		i += 1;
        	} else if (value > 0xDF && value < 0xF0) {
            		str += String.fromCharCode((value & 0x0F) << 12 | (data[i + 1] & 0x3F) << 6 | data[i + 2] & 0x3F);
            		i += 2;
        	} else {
            		// surrogate pair
            		var charCode = ((value & 0x07) << 18 | 
					(data[i + 1] & 0x3F) << 12 |
					(data[i + 2] & 0x3F) << 6 |
					 data[i + 3] & 0x3F) - 0x010000;

            		str += String.fromCharCode(charCode >> 10 | 0xD800, charCode & 0x03FF | 0xDC00);
            		i += 3;
        	}
    	}
   	 return str;
}

/**
 * take in a string and turn it into a UTF8 byte array
 **/
export function toUTF8Array(str: string) {
    	var utf8 = [];
    	for (var i=0; i < str.length; i++) {
        	var charcode = str.charCodeAt(i);
        	if (charcode < 0x80) utf8.push(charcode);
        	else if (charcode < 0x800) {
           		utf8.push(0xc0 | (charcode >> 6),
                      		  0x80 | (charcode & 0x3f));
        	}
        	else if (charcode < 0xd800 || charcode >= 0xe000) {
            		utf8.push(0xe0 | (charcode >> 12),
                      		  0x80 | ((charcode>>6) & 0x3f),
                      		  0x80 | (charcode & 0x3f));
        	}
        	// surrogate pair
        	else {
            		i++;
            		charcode = ((charcode&0x3ff)<<10)|(str.charCodeAt(i)&0x3ff)
            		utf8.push(0xf0 | (charcode >>18),
                      		  0x80 | ((charcode>>12) & 0x3f),
                      		  0x80 | ((charcode>>6) & 0x3f),
                      		  0x80 | (charcode & 0x3f));
        	}
    	}
    	return utf8;
}

/****************************************************************
 * setup layouts and interfaces					*
 ****************************************************************/

/**
 * flags layout
 **/
const flags = (property = "flags") => {
	return BufferLayout.blob(2, property);
};

/**
 * public key layout
 **/
const publicKey = (property = "publicKey") => {
	return BufferLayout.blob(32, property);
};

/**
 * pieceID layout
 **/
const pieceSlug = (property = "pieceSlug") => {
	return BufferLayout.blob(67, property);
};	// 63B String with 4B Vec tag

/**
 * refSlug layout
 **/
const refSlug = (property = "refSlug") => {
	return BufferLayout.blob(20, property);
};	// 16B String with 4B Vec tag

/**
 * u64 layout
 **/
const uint64 = (property = "uint64") => {
  return BufferLayout.blob(8, property);
};

/**
 * account struct MAIN
 **/
export const MAIN_DATA_LAYOUT = BufferLayout.struct([
	BufferLayout.u16("flags"),
	publicKey("operator"),
	uint64("balance"),
	uint64("netsum"),
	BufferLayout.u16("piececount"),
]);	
export interface MAINlayout {
	flags: number;
	operator: Uint8Array;
	balance: Buffer;
	netsum: Buffer;
	piececount: number;
}

/**
 * account struct PIECE
 **/
export const PIECE_DATA_LAYOUT = BufferLayout.struct([
	BufferLayout.u16("flags"),
	publicKey("operator"),
	uint64("balance"),
	uint64("netsum"),
	BufferLayout.u16("refcount"),
	pieceSlug("pieceslug"),
]);
export interface PIECElayout {
	flags: number;
       	operator: Uint8Array;
	balance: Buffer;
	netsum: Buffer;
	refcount: number;
	pieceslug: Uint8Array;
}

/**
 * account struct REF
 **/
export const REF_DATA_LAYOUT = BufferLayout.struct([
	BufferLayout.u16("flags"),
	publicKey("target"),
	BufferLayout.u32("fract"),
	uint64("netsum"),
	refSlug("refslug"),
]);
export interface REFlayout {
	flags: number;
       	target: Uint8Array;
	fract: number;
	netsum: Buffer;
	refslug: Uint8Array;
}
