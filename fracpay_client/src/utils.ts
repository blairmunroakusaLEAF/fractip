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
import * as BigNumber from "bignumber";

/****************************************************************
 * declare constants						*
 ****************************************************************/

const FLAGS_SIZE = 2;
const PUBKEY_SIZE = 32;
const BALANCE_SIZE = 8;
const NETSUM_SIZE = 8;
const COUNT_SIZE = 2;
const FRACT_SIZE = 4;
const PIECESLUG_SIZE = 67; 	// 63 + 4
const REFSLUG_SIZE = 20;	// 16 + 4

const MAIN_SIZE = FLAGS_SIZE +
		  PUBKEY_SIZE +
		  BALANCE_SIZE +
		  NETSUM_SIZE +
		  COUNT_SIZE;		// = 52

const PIECE_SIZE = FLAGS_SIZE +
		  PUBKEY_SIZE +
		  BALANCE_SIZE +
		  NETSUM_SIZE +
		  COUNT_SIZE +
		  PIECESLUG_SIZE;	// = 119

const REF_SIZE = FLAGS_SIZE +
		  PUBKEY_SIZE +
		  NETSUM_SIZE +
		  FRACT_SIZE +
		  REFSLUG_SIZE;		// = 66

export let connection: Connection;
export let operator: Keypair;
export let fracpayID: PublicKey;

const PROGRAM_KEYFILE = "fracpay_server-keypair.json";
const PROGRAM_PATH = path.resolve(
	"/Users/blairmunroakusa/_ROOT/___LEAF/fracpay/fracpay_server/target/deploy"
);
const PROGRAM_KEYPAIR_PATH = path.join(PROGRAM_PATH, PROGRAM_KEYFILE);

/****************************************************************
 * general functions						*
 ****************************************************************/

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
  	if (!operator) {
    		const {feeCalculator} = await connection.getRecentBlockhash();

 		// Calculate the cost to fund the greeter account
    		fees += await connection.getMinimumBalanceForRentExemption(MAIN_SIZE + PIECE_SIZE + REF_SIZE);

    		// Calculate the cost of sending transactions
    		fees += feeCalculator.lamportsPerSignature * 100; // wag

    		operator = await getOperator();
  	}

  	let lamports = await connection.getBalance(operator.publicKey);
  	if (lamports < fees) {

    		// If current balance is not enough to pay for fees, request an airdrop
    		console.log(
			`! Unfortunately you do not have enough SOL to initialize an account.\n`,
			`  You need ${fees/LAMPORTS_PER_SOL} SOL to initialize account.`,
		)
  	}

  	console.log(
    		". Operator account is:\t",
    		operator.publicKey.toBase58(),
    		"containing",
    		lamports / LAMPORTS_PER_SOL,
    		"SOL to pay for fees",
  	);
}

/**
 * setup operator as Keypair
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
 * take in a UTF8 byte array and turn it into a string
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
