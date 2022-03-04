	// find PIECE address
	//
	// create PIECE pda seed	
	let countPIECElow = countPIECE[0] & 0xFF; // mask for low order count byte
	let countPIECEhigh = (countPIECE[0] >> 8) & 0xFF; // shift and mask for high order count byte
	var pdaPIECEseed = toUTF8Array(pdaMAIN.toString().slice(0,30)).concat(countPIECEhigh, countPIECElow);	

	let [pdaPIECE, bumpPIECE] = await PublicKey.findProgramAddress(
		[new Uint8Array(pdaPIECEseed)], fracpayID);
	console.log(`. MAIN pda:\t\t${pdaPIECE.toBase58()} found after ${256 - bumpPIECE} tries`);


	/////////////////////
	

	const PIECEaccount = await connection.getAccountInfo(pdaPIECE);

	const encodedPIECEstate = PIECEaccount.data;
	const decodedPIECEstate = PIECE_DATA_LAYOUT.decode(encodedPIECEstate) as PIECElayout;
	var PIECE = {
		flags: decodedPIECEstate.flags,
		operator: new PublicKey(decodedPIECEstate.operator),
		balance: new BigNumber("0x" + decodedPIECEstate.balance.toString("hex")),
		netsum: new BigNumber("0x" + decodedPIECEstate.netsum.toString("hex")),
		refcount: decodedPIECEstate.refcount,
		pieceslug: decodedPIECEstate.pieceslug.toString(),
	};
	// to print BigNumber, cast to string
