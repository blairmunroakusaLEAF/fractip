import { AccountLayout, Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import BN = require("bn.js");
import {
  EscrowLayout,
  ESCROW_ACCOUNT_DATA_LAYOUT,
  getKeypair,
  getProgramId,
  getPublicKey,
  getTerms,
  getTokenBalance,
  writePublicKey,
} from "./utils";
// setup layouts and interface
//

/**
 * uint8, uint16, uint32 is already taken care of in Layout Module buffer-layout
 **/

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
	return BufferLayout.blob(68, property);
};	// 64B String with 4B Vec tag

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
 * sizes (because magic numbers are annoying)
 **/

const FLAGS_SIZE = 2;
const PUBKEY_SIZE = 64;
const BALANCE_SIZE = 8;
const NETSUM_SIZE = 8;
const COUNT_SIZE = 4
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
/**
 * account struct MAIN
 **/

const MAIN_DATA_LAYOUT = BufferLayout.struct([
	BufferLayout.u8("flags"),
	publicKey("operator"),
	uint64("balance"),
	uint64("netsum"),
	BufferLayout.u32("piececount"),
]);			
interface MAINlayout {
	flags: number;
	operator: Uint8Array;
	balance: Uint8Array;
	netsum: Uint8Array;
	piececount: number;
}

/**
 * account struct PIECE
 **/
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
 **/
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



const testbed = async () => {
	
	// get preliminary info
	const payfractID = getProgramID();
	const OperatorKEY = getPublicKey("operator");
	const OperatorID = "TESTOPERATORID";
	const connection = new Connection("http://localhost:8899", "confirmed");
	var PIECEno = 0;
	var REFno = 0;

	// find MAIN address
	let [pdaMAIN, bumpMAIN] = await PublicKey.findProgramAddress(
		[Buffer.from(OperatorID)], payfractID);
	console.log(`MAIN pda ${pdaMAIN.toBase58()} found after ${256 - bumpMAIN} tries`);

	// find PIECE address
	let [pdaPIECE, bumpPIECE] = await PublicKey.findProgramAddress(
		[Buffer.from(pdaMAIN), Buffer.from(PIECEno)], payfractID);
	console.log(`Self PIECE pda${pdaPIECE.toBase58()} found after ${256 - bumpPIECE} tries`);
	
	// find REF address
	let [pdaREF, bumpREF] = await PublicKey.findProgramAddress(
		[Buffer.from(pdaPIECE), Buffer.from(REFno)], payfractID);
	console.log(`Self REF pda ${pdaREF.toBase58()} found after ${256 - bumpREF} tries`);

	// check payfract for MAINPDA
		// 1) get payfract accounts with flag bits 1 & 2 low
		// 2) compare resulting object against MAINPDA
	
	// no preexisting MAINPDA, so create account
	//
	// add some data sizes
	// MAIN:
	let InitMAINtx = new Transaction().add(
		new TransactionInstruction({
			keys: [
				{ pubkey: OperatorKEY, isSigner: true,isWritable: true, },
				{ pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false, },
				{ pubkey: pdaMAIN, isSigner: false, isWritable: true, },
				{ pubkey: pdaPIECE, isSigner: false, isWritable: true, },
				{ pubkey: pdaREF, isSigner: false, isWritable: true, },
				{ pubkey: SystemProgram.programId, isSigner: false, isWritable: false, },
			],
			data: Buffer.from(
				Uint8Array.of(0, MAIN_SIZE, bumpMAIN, PIECE_SIZE, bumpPIECE, REF_SIZE, bumpREF, operatorID)),
			programId: payfractID,
		})
		.add(

	);

	console.log(`TXhash: ${await connection.sendTransaction(InitMainTX, [OperatorID])}`);


	createOperatorMainTX = SystemProgram.createAccount

};

const getPrivateKey = (name: string) =>
	Uint8Array.from(
		JSON.parse(fs.readFileSync(`./keys/${name}_pri.json`) as unknown as string)
	);
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
const getKeypair = (name: string) =>
	new Keypair({
		publicKey: getPublicKey(name).toBytes(),
		secretKey: getPrivateKey(name),
	});
const getProgramID = () => {
	try {
		return getPublicKey("payfract");
	} catch (error) {
		console.log("Given programId is missing or incorrect");
	process.exit(1);
	}
};

testbed();
