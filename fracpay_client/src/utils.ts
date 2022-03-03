import {
  Keypair,
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  SystemProgram,
  TransactionInstruction,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';

import os from "os";
import fs from "mz/fs";
import path from "path";
import yaml from "yaml";

const FLAGS_SIZE = 2;
const PUBKEY_SIZE = 32;
const BALANCE_SIZE = 8;
const NETSUM_SIZE = 8;
const COUNT_SIZE = 2;
const PIECESLUG_SIZE = 67; 	// 63 + 4
const REFSLUG_SIZE = 20;	// 16 + 4

const MAIN_SIZE = FLAGS_SIZE +
		PUBKEY_SIZE +
		BALANCE_SIZE +
		NETSUM_SIZE +
		COUNT_SIZE;	// = 86
const PIECE_SIZE = FLAGS_SIZE +
		PUBKEY_SIZE +
		BALANCE_SIZE +
		NETSUM_SIZE +
		COUNT_SIZE +
		PIECESLUG_SIZE;	// = 154
const REF_SIZE = FLAGS_SIZE +
		PUBKEY_SIZE +
		NETSUM_SIZE +
		COUNT_SIZE +
		REFSLUG_SIZE;	// = 98

export let connection: Connection;
export let payer: Keypair;
const PROGRAM_PATH = path.resolve("/Users/blairmunroakusa/_ROOT/___LEAF/fractip/fractip_server/target/deploy");
const PROGRAM_KEYPAIR_PATH = path.join(PROGRAM_PATH, "fractip_server-keypair.json");
export let fracpayID: PublicKey;




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
`! Failed to read program keypair at '${PROGRAM_KEYPAIR_PATH}' due to error: ${errMsg}. Program may need to be deployed with \`solana program deploy dist/program/helloworld.so\``,
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
 * establish payer
 **/
export async function establishPayer(): Promise<void> {
  let fees = 0;
  if (!payer) {
    const {feeCalculator} = await connection.getRecentBlockhash();

    // Calculate the cost to fund the greeter account
    fees += await connection.getMinimumBalanceForRentExemption(MAIN_SIZE + PIECE_SIZE + REF_SIZE);

    // Calculate the cost of sending transactions
    fees += feeCalculator.lamportsPerSignature * 100; // wag

    payer = await getPayer();
  }

  let lamports = await connection.getBalance(payer.publicKey);
  if (lamports < fees) {
    // If current balance is not enough to pay for fees, request an airdrop
    const sig = await connection.requestAirdrop(
      payer.publicKey,
      fees - lamports,
    );
    await connection.confirmTransaction(sig);
    lamports = await connection.getBalance(payer.publicKey);
  }

  console.log(
    '. Operator account is:\t',
    payer.publicKey.toBase58(),
    'containing',
    lamports / LAMPORTS_PER_SOL,
    'SOL to pay for fees',
  );
}
async function getPayer(): Promise<Keypair> {
  try {
    const config = await getConfig();
    if (!config.keypair_path) throw new Error('Missing keypair path');
    return await createKeypairFromFile(config.keypair_path);
  } catch (err) {
    console.warn(
      '! Failed to create keypair from CLI config file, falling back to new random keypair',
    );
    return Keypair.generate();
  }
}
async function createKeypairFromFile(
  filePath: string,
): Promise<Keypair> {
  const secretKeyString = await fs.readFile(filePath, {encoding: 'utf8'});
  const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
  return Keypair.fromSecretKey(secretKey);
}

/**
 * small misc
 **/

// takes in 64 byte array
const getPrivateKey = (name: string) =>
	Uint8Array.from(
		JSON.parse(fs.readFileSync(`./keys/${name}_pri.json`) as unknown as string)
	);
// takes in base58 formatted string
const getPublicKey = (name: string) =>
	new PublicKey(
		JSON.parse(fs.readFileSync(`./keys/${name}_pub.json`) as unknown as string)
 	);

const writePublicKey = (publicKey: PublicKey, name: string) => {
	fs.writeFileSync(
		`./keys/${name}_pub.json`,
		JSON.stringify(publicKey.toString())
	);
};

// public key is 32 bytes, log printed as 64 hex characters
// private key is 64 bytes, log printerd as 64 byte array
export const getKeypair = (name: string) =>
	new Keypair({
		publicKey: new Uint8Array(getPublicKey(name).toBytes()),
		secretKey: getPrivateKey(name),
	});
export const getProgramID = () => {
	try {
		return getPublicKey("fractip");
	} catch (error) {
		console.log("Given programId is missing or incorrect");
	process.exit(1);
	}
};


export function fromUTF8Array(data: Uint8Array) { // array of bytes
    var str = '',
        i;

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
            var charCode = ((value & 0x07) << 18 | (data[i + 1] & 0x3F) << 12 | (data[i + 2] & 0x3F) << 6 | data[i + 3] & 0x3F) - 0x010000;

            str += String.fromCharCode(charCode >> 10 | 0xD800, charCode & 0x03FF | 0xDC00);
            i += 3;
        }
    }

    return str;
}
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
