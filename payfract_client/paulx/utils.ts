import { Connection, Keypair, PublicKey } from "@solana/web3.js";
//@ts-expect-error missing types
import * as BufferLayout from "buffer-layout";

import * as fs from "fs";

export const logError = (msg: string) => {
  console.log(`\x1b[31m${msg}\x1b[0m`);
};

export const writePublicKey = (publicKey: PublicKey, name: string) => {
  fs.writeFileSync(
    `./keys/${name}_pub.json`,
    JSON.stringify(publicKey.toString())
  );
};

export const getPublicKey = (name: string) =>
  new PublicKey(
    JSON.parse(fs.readFileSync(`./keys/${name}_pub.json`) as unknown as string)
  );

export const getPrivateKey = (name: string) =>
  Uint8Array.from(
    JSON.parse(fs.readFileSync(`./keys/${name}.json`) as unknown as string)
  );

export const getKeypair = (name: string) =>
  new Keypair({
    publicKey: getPublicKey(name).toBytes(),
    secretKey: getPrivateKey(name),
  });

export const getProgramId = () => {
  try {
    return getPublicKey("program");
  } catch (e) {
    logError("Given programId is missing or incorrect");
    process.exit(1);
  }
};

export const getTerms = (): {
  aliceExpectedAmount: number;
  bobExpectedAmount: number;
} => {
  return JSON.parse(fs.readFileSync(`./terms.json`) as unknown as string);
};

export const getTokenBalance = async (
  pubkey: PublicKey,
  connection: Connection
) => {
  return parseInt(
    (await connection.getTokenAccountBalance(pubkey)).value.amount
  );
};

/**
 * Layout for a public key
 */
const publicKey = (property = "publicKey") => {
  return BufferLayout.blob(32, property);
};

/**
 * Layout for a 64bit unsigned value
 */
const uint64 = (property = "uint64") => {
  return BufferLayout.blob(8, property);
};

export const ESCROW_ACCOUNT_DATA_LAYOUT = BufferLayout.struct([
  BufferLayout.u8("isInitialized"),
  publicKey("initializerPubkey"),
  publicKey("initializerTempTokenAccountPubkey"),
  publicKey("initializerReceivingTokenAccountPubkey"),
  uint64("expectedAmount"),
]);

export interface EscrowLayout {
  isInitialized: number;
  initializerPubkey: Uint8Array;
  initializerReceivingTokenAccountPubkey: Uint8Array;
  initializerTempTokenAccountPubkey: Uint8Array;
  expectedAmount: Uint8Array;
}

/////////////////////////////// my stuff below

// setup layouts and interface
//

/**
 * uint8, uint16, uint32 is already taken care of in Layout Module buffer-layout
 **/

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
 * account struct Main
 **/
export const MAIN_ACCOUNT_DATA_LAYOUT = BufferLayout.struct([
	publicKey("operator"),
	BufferLayout.u8("flags"),
	uint64("balance"),
	uint64("netsum"),
	BufferLayout.u32("piececount"),
]);
export interface MainLayout {
	operator: Uint8Array;
	flags: number;
	balance: Uint8Array;
	netsum: Uint8Array;
	piececount: number;
}

/**
 * account struct Piece
 **/
export const PIECE_ACCOUNT_DATA_LAYOUT = BufferLayout.struct([
	publicKey("operator"),
	BufferLayout.u8("flags"),
	uint64("balance"),
	uint64("netsum"),
	BufferLayout.u32("refcount"),
	pieceSlug("pieceslug"),
]);
export interface PieceLayout {
       	operator: Uint8Array;
	flags: number;
	balance: Uint8Array;
	netsum: Uint8Array;
	refcount: number;
	pieceslug: Uint8Array;
}

/**
 * account struct Ref
 **/
export const REF_ACCOUNT_DATA_LAYOUT = BufferLayout.struct([
	publicKey("target"),
	BufferLayout.u8("flags"),
	BufferLayout.u32("fract"),
	uint64("netsum"),
	refSlug("refslug"),
]);
export interface RefLayout {
       	target: Uint8Array;
	flags: number;
	fract: number;
	netsum: Uint8Array;
	refslug: Uint8Array;


