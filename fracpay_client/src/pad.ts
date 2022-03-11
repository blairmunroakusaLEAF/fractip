
const BigNumber = require("bignumber.js");
const crypto = require('crypto-js');
// misc solana
import {
  	sendAndConfirmTransaction,
	Keypair,
	PublicKey,
} from "@solana/web3.js";
const bs58 = require("bs58");


// utility functions
import {
	newKeyhash,
	createTX,
	deriveAddress,
	availableIDcheck,
	establishConnection,
	establishOperator,
	checkProgram,
	toUTF8Array,
	createSeed,
} from "./utils";
/**
 * main
 **/

const InitPIECE = async () => {
	
	try {
	
		var testkey = new Keypair();
		console.log(testkey.publicKey);
		
		const count = new Uint16Array(1);
		count[0] = 0;

		var keyhash = crypto.SHA256(testkey.publicKey.toString());
		keyhash = bs58.encode(Buffer.from(keyhash.toString(), 'hex'));
		keyhash = new PublicKey(keyhash);
		console.log(keyhash, typeof keyhash);
		//const pubkey = new PublicKey(bs58.encode(fromkey));
	//	console.log(c);

	//	hash.toString(CryptoJS.enc.Base64)

		const [key, hash] = newKeyhash();
		console.log(key, hash);


	} catch {
		console.log(Error);
		console.log(Error.prototype.stack);
	}
};

InitPIECE();
