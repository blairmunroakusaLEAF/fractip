### WORKING NOTES blairmunroakusa@1828.020622.anch.AK:bedroomstudy

I need to get setup and I need to yank the escrow program reference implementation from solana web:

[https://paulx.dev/blog/2021/01/14/programming-on-solana-an-introduction/](https://paulx.dev/blog/2021/01/14/programming-on-solana-an-introduction/)

For setup, I need to get situated with the CLI. PATH echo says I should be in business, but bash doesn't recognize 'solana'.

Ok just needed to reinstall and update PATH. Now I am looking at the token program command line utility. Installing the rust crates now and there are a lot. 

It looks like I am all set up for now.

Procrastinating...reading aimlessly through escrow example...already been here.

## PROGRAMMING MODEL (solana documentation)

[https://docs.solana.com/developing/programming-model/overview](https://docs.solana.com/developing/programming-model/overview)

App interacts with programs by sending tx and instructions to runtime. Programs are deployed by app devs prior to. Instructions are exe sequentially and atomically for each tx. Interaction is atomic => any invalid instr invalidates interaction.

###. TRANSACTIONS

Runtime executes apporpriate programs to carry out given instructions.

#####	. ANATOMY
```
TX FORMAT
. tx is compact array of sigs, followed by message
. each sig is a sig of message
. runtime verifies # sigs match # in message header
. runtime verifies private/public key sigs (how?)
. sigs are 64B ed25519 binary
MSG FORMAT
. message has header, array of acct addrs, recent blockhash, and array instr
. header, value 1 = # req sigs, value 2 = # sig accts readonly, value 3 = # readonly w no req sigs
. this information tells runtime how to treat each of the accts in the array of acct addresses
. 1st addrs reg sigs, write-access addrs 1st, readonly following
. sig req are first, and non sig req follow
. blockhash is 32B SHA256. indicates when client last observed ledger. not valid if too old.
INSTRUCTION FORMAT
. contains program ID index, then acct addrs indices, then opaque 8b data
. ID index IDs program that can make sense of 8b data
. ID is u8b index to acct addr in mssg arry of acct addrs
```

#####	. INSTRUCTIONS
```
. each instruction specs program, subset of addrs to pass, and dataB array passed to program
. program interperets dataB array and operates on accts specified by instr
. program succeeds or throws error, which fails entire tx
. 'programs typically provide helper functions to construct the instr they support'
. program id specifies which program will execute instruction
. Native Programs are built directly into runtime
. accounts refd by instr represent on-chain state
. opaque Barray contents are program specific, usually containing necessary operations
. plus, additional info that operations need which is not contained in account
. programs can specify how much info is encoded into opaque Barray
```

### WORKING NOTES RESUMED blairmunroakusa@0816.020722.anch.AK:bedroomstudy

#####	. INSTRUCTIONS
```
. choice must be mindful of decoding overhead for onchain program
. apparently solanas token program provides efficient encoding example
. tx instructions may be in any order
```

#### 	. SIGNATURES
```
. each tx lists all acct pubkeys referenced by tx instrs
. subset of these pubkeys also have tx signature
. usually sig authorization allows acct debiting or data modification
```

####	. RECENT BLOCKHASH
```
. tx includes recent blockhash to prevent duplication and provide tx with lifetime
. the hash allows of rejection of any tx that is identical to another
```

###. ACCOUNTS

####	. STORING STATES BETWEEN TX (ACCOUNTS)
```
. acts are like files in linux
. accounts pay rent to remain in validator memory
. (validators periodically scan and collect rent)
. accounts are rent-exempt if they have a sufficien amount of lamports
. acct addresses are 256b pubkeys
```

####	. SIGNERS
```
. sigs includeds in tx signify owner signed tx with prikey to authorize tx
. the corresponding pubkey account is the 'signer'
. acct metadata communicates this to the program in question
```

####	. READ-ONLY
```
. parallel acct processing between tx works when accts are read-only
. read-only is indicated in tx about some of accts included in tx
. read-only accts can be read concurrently by multiple programs
. attempt to modify read-only acct fails tx
```

####	. EXECUTABLE
```
. accounts are marked exe in metadata
. exed by including pubkey (address) in instructions program id
. loaders 'own' executable accounts
. marking program 'final' renders program immutable
```

####	. CREATING
```
. to create acct, client generates keypair using SystemProgram::CreateAccount
. this creation is with specified fixed B storage preallocated
. account max storage is 10MB
. operators can create derived addresses
. since 256b key, 2^256 possible accounts provides collision resistance
. one can pass nonexistent account to program,
	. then system program passes empty account owned by system program
```

####	. OWNERSHIP AND ASSIGNMENT TO PROGRAMS
```
. the system program is also called the system account
. new accounts by default are owned by system program
. the owner of an account (in metadata) is a program id
. only the owner may write to account
. runtime grants program write access if id matches owner
. system program allows clients to xfer lamports and assign account ownership
. assigning acct ownership means changing owner to a different program id
. programs that don't own account can only credit and read
```

####	. VERIFYING VALIDITY OF UNMODIFIED, REFERENCE-ONLY ACCOUNTS
```
. program reading account really should check its validity
. because malicious users could spoof with acct containing arbitrary data
. security model => acct data can ONLY be modified by acct owner program
. so, a program can trust the incoming writes come from owned accounts
. runtime enforces this
. failure to check acct validity could lead to reading wrong acct
. to do, 'program should check acct address is what expects, or that acct is properly owned
. EG, sysvar accounts...the only way to know correct data is to verify account
. apparently, solana SDK checks sysvar accounts validity during deserialization
. or, safely use sysvars get() function, which eliminates need for checks
```

####	. RENT
```
. in contrast to bitcoin and ethereum, STORAGE COSTS ON SOLANA
. all new accounts must be rent exempt
RENT EXEMPTION
. rent-exempt == acct holds two years worth of rent
. balance checked for each debit, and if tx takes below min, tx fail
. exe accts must also be rent-exempt to avoid being purged
. use getMinimumBalanceForRentExeption ('RPC endpoint') to determine min balance
. EG, program exe = 15000B requires 105,290,880 lamports (~0.105 SOL)
```

###. RUNTIME

####	. CAPABILITY OF PROGRAMS
```
. beyond runtime write debit restriction, program enforces additional limits on clients ops on owned programs
. the system program does this by allowing debits in presence of valid sigs
. effectively, set of owned accounts acts as a key-value store, key == addrs, value = program bins
. (again, accounts hold program state)
. after runtime exe acct instr, it checks acct metadata to check if acct policy was violated
	. if violated, runtime unwinds and fails tx
POLICY
. owner change owner
	. <=> acct is writable
	. <=> acct NOT exe
	. <=> data is zero-init or empty
. read-only and exe account balance may NOT change
. only sysprog can change data size, and only if owned
. only owner may change data
	. <=> acct is writable
	. <=> acct NOT exe
. exe may only be set once (one way), and only acct owner may do so
THIS IS VERIFIED BY RUNTIME AFTER EACH INSTRUCTION
```

####	. COMPUTE BUDGET
```
. each tx instr has a compute budget
. this is a batch of consumable 'computation units'
. exceeding budget halts and throws error
. BPF instr and sys calls incur compute cost
. cross-program invocations -> inherited budget
. exceeding budget in this case halts entire chain and parent
CURRENT BUDGET
. max units 200000 = # BPF instr
. log units 100 = 2000 log msg
. max invok depth = 4
. call depth max = 64
. stack frame size = 4096 (4k)
```

###. CALLING BETWEEN PROGRAMS 

####	. CROSS PROGRAM INVOKATION
```
. this is for one program to invoke an instruction of another
. invoke() is the runtime function to call
. invoke requires all accounts needed, exept for exe acct
INSTRUCTIONS THAT REQUIRE PRIVILEGES
, privilege extension works because programs are immutable
PROGRAM SIGNED ACCOUNTS
. a program can issue instr containing signed accts not contained in parent tx
. this is done using program derived addresses
CALL DEPTH
. cross call depth is 4
REENTRANCY
. direct self recursion is capped to fixed depth
```

####	. PROGRAM DERIVES ADDRESSES
```
. programs can generate own sigs to call between programs
. ie, programs act as signers
. kindof confused by this part
. program derived addr allow program to control addr that no external operators can control
. basically this allows operators to assign assets to programs to manage safely
PRIVATE KEYS FOR PROGRAM ADDRESSES
! program address does not lie on ed25519 curve, thus has no private key
. this is to ensure there is no private key
```

blairmunroakusa@1042.020722.anch.AK
