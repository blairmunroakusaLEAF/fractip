##### blairmunroakusa@1601.022322.anch.AK:greenchair

This is a document dedicated to a pseudocode implementation of payfract.

function prototypes:
```
create_account(target Pubkey, operatorID String) -> account {}
modify_account(self, newwallet Pubkey) -> self {}		// can only change beneficiary, new OPID => new account
delete_account(self, liquidate Pubkey) -> Result {}
link_account()			***need to ponder***		// account link creates org account?
list_account() -> Vec<account> {}				// admin feature only?
								// generate list of all opmain accounts
create_piece(target Pubkey, pieceID String) -> piece {}
modify_piece(self, target Pubkey, pieceID String) -> self {}
delete_piece(self, liquidate Pubkey) -> Result {}
link_piece(operatorID Address, invitation Pubkey) -> Result {}	// link piece to account
list_piece(operatorID Address) -> Vec<pieceID<String>> {}

create_ref(pieceID Address, target Address [|| memoryslug String], fract u32) -> ref {}
modify_ref(self, target Address, fract u32) -> self {}
delete_ref(self, liquidate Pubkey) -> Result {}
link_ref(pieceID Address, invitation Pubkey) -> Result {}	// link ref to piece
list_ref(pieceID Address) -> Vec<pieceID<String>> {}

give_payfract(amount u64, pieceID Address) -> Result {}
push_payfract(pieceID Address) -> Result {}
pull_payfract(operatorID Address) -> Result {}

generate_invite_key(memoryslug String, pieceID Address) -> <slug.pubkey Invitekey> {}
```

data types:
```
account						54
	onchain				13
		flags u8		1
		operator Pubkey		32
		net u64			8
		bal u64			8
	offchain (temp)
		
piece
	onchain					117
		flags u8		1
		operator Pubkey		32
		bal u64			8
		net u64			8
		pieceID String		68
	offchain (temp)

ref
	onchain					65
		flags u8		1
		target Pubkey		32
		fract u32		4
		net u64			8
		slug String		20
	offchain (temp)

```

Does pieceID need to be constant allocated size? Yo just use ASCII, not unicode.

SYMBOL: & means client side, # means server side

creation functions
```
create_account(wallet(target) Pubkey, operatorID) -> account pda {

	// note, operatorID == pieceID[0] (self piece ID)
	
&	RPC get accounts ... if E account with wallet pubkey == target, WARNING	

&	take wallet Pubkey + operatorID --> derive account pda
					    create account

&	RPC get accounts ... if E pda wallet + operatorID, ERROR, account already exists

	else...instruction sent to payfract, CreateOperatorMain account
		payfract gets fees and rent from wallet
&		creates rent exempt pda
		set, flags = 00000000
		set, target = operator Pubkey
		set, bal, net = 0,

#	create_self_piece()
&		payfract generates pda from opmain Address + 0 (+bump)
#?		payfract gets rent and fees from wallet
#&?		creates rent-exempt account with pda
#		set, flags = 11000000
#		set, target = operator Pubkey
#		set, net, bal = 0	
	return

#		create_self_ref()
			payfract generates pda from selfpiece Address + 0 (+bump)
			payfract gets rent and fees from wallet
			creates rent-exempt account  with pda
			set, flags = 01000000 		(note, non self piece account flags 10000000)
			set target = operator Pubkey
			set, bal, net = 0
		return

}
		
