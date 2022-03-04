# LOG


. added account check to InitMAIN
. cleaning up client side
x creating client function to gather account data and print
	> need to clean things up first
. figured out what to do
blairmunroakusa@0630.030422.anch.AK:goldcouch
```
```
blairmunroakusa@1926.030322.anch.AK:FT
. updated github
. set PIECE struct for get account info
. adjusting codebase to match decode scheme on client side
blairmunroakusa@1756.030322.anch.AK:FT
. finished decode scheme for client side
blairmunroakusa@1630.030322.anch.AK:FT
~ flattop hike and session
blairmunroakusa@1251.030322.anch.AK:redcouch
. creating decode scheme on client side
. creating InitPIECE
	. checking decode on client side
blairmunroakusa@0857.030322.anch.AK:goldcouch
. created account data layout key
. verified that fracpay loaded correct initial info in pdas
blairmunroakusa@0720.030322.anch.AK:goldcouch
```
```
blairmunroakusa@1839.030222.anch.AK:FT
. InitMAIN officially lives
. troubleshooting server (not creating pdas)
	. seeds were off
. troubleshooting client
	. got tx to fire
	. successfully verified account deployment
	. successfully established payer, (my keypair)
	. verified connection, localhost, solana-core 1.9.5
blairmunroakusa@0542.030222.anch.AK:goldcouch
```
```
. troubleshooting client
. deploying fractip server side
. reformattel log
blairmunroakusa@0520.030122.anch.AK:goldcouch
```
```
blairmunroakusa@1725.022822.anch.AK:redcouch
. cleaned up server rs code
blairmunroakusa@1035.022822.anch.AK:goldcouch
. got payfract server code tp compile
blairmunroakusa@0729.022822.anch.AK:goldcouch
. got initMAIN ts to compile
blairmunroakusa@0500.022822.anch.AK:goldcouch
```
```
blairmunroakusa@0500.022722.anch.AK:goldcouch
. preparing codebase for first round of testing
. finished first process instruction
. working on InitMAIN, processor.rs
```
```
blairmunroakusa@1734.022622.anch.AK:Manhattan
. working on processor.rs
blairmunroakusa@0730.022622.anch.AK:goldcouch
. finishing up state.rs
```
```
blairmunroakusa@1919.022522.anch.AK:FT
. finishing up state.rs
blairmunroakusa@1115.022522.anch.AK:steamdot
. maniacal coding, working on client and 
blairmunroakusa@0440.022522.anch.AK:gold couch
. writing out flows again
. beginning monolithic client implementation
. undoing git fuckupery
```
```
blairmunroakusa@1757.022422.anch.AK:redcouch
. wrote out payfractal flow for one piece round
. need to determine if payfract can hit all refs on push (or need be one tx at a time)
	. reason for all at once is a failure in one would roll back tx, otherwise flagging may be needed
	. nope. needs to be one at a time for scaleability (ie thousands of ref accounts)
blairmunroakusa@1333.022422.anch.AK:KBC
. dialing in rust and ts structs
. picking at hello world client side typescript
blairmunroakusa@0455.022422.anch.AK:goldcouch
. finalizing types
. looking into how to check string input for size
. slapping together hello world to test compute budget pda cost
. writing out new flow from dream
. update github
```
```
blairmunroakusa@0600.022322.anch.AK:upstairs
. forum post asking about compute budget and pda derivation
. writing out some pseudocode and data types
```
```
blairmunroakusa@1547.022122.anch.AK:FT
. taking some time to write about design after having 6 days' break
```
```
blairmunroakusa@0650.021622.anch.AK:redcouch
. reviewing progress since yesterday in writing storm
```
```
blairmunroakusa@0630.021522.anch.AK:redcouch
. working on figuring out the fingerprint nonsense
```
```
blairmunroakusa@0520.021422.anch.AK:goldcouch
. Figuring out how to link wallets
. I need to figure out how permissions will work
	. got it .. fingerprint
. updating github
```
```
blairmunroakusa@1356.021322.anch.AK:goldcouch
. figuring out how to manage account ownership
blairmunroakusa@0736.021322.anch.AK:redcouch
. creating code skeleton for server side
```
```
blairmunroakusa@1454.021222.anch.AK:goldcouch
. studying serialization technique
. studying CPI
blairmunroakusa@0711.021222.anch.AK:goldcouch
. determining compute budget cost of deriving accts from seeds
. studying SPL
. crawling code examples, studying pieces
```
```
blairmunroakusa@1602.021122.anch.AK:FT
. working on building out skeleton
. mindlinking paulx, helloworld extension, helloworld
. figuring out where to start
blairmunroakusa@0515.021122.anch.AK:goldcouch
. writing storm resolving piece structure
. reading up on javascript RSA capabilities
. reading up on discriminators
. researching validation via certiks
```
```
blairmunroakusa@0652.021022.anch.AK:redcouch
. lots of thinking on architecture and long-game
. writing storm to work out payfract design
```
```
blairmunroakusa@1855.020922.anch.AK:FT
. drafting out node structure and program flow candidates
blairmunroakusa@1300.020922.anch.AK:KBC
. reading solana hello world typescript client
blairmunroakusa@0733.020922.anch.AK:redcouch
. reading reference implementations
```
```
blairmunroakusa@1515.020822.anch.AK:redcouch
. taking break to work on authentification design doc
. scraping ref implementations for notes
blairmunroakusa@0833.020822.anch.AK:redcouch
. breaking to apply to jobs
. scraping ref implementations for notes
. updating vimrc
. collecting reference implementations
. took little moment to restructure working notes
. reviewing prior day's notes
	. rereading working notes
. updating log format to .md
```
```
blairmunroakusa@1930.020722.anch.AK:goldcouch
. reading reference implementation from soldev -- 'solana twitter'
blairmunroakusa@18.020722.anch.AK:goldcouch
. reading cookbook
blairmunroakusa@1549.020722.anch.AK:bedroomstudy
. browsing sysvar cluster data
. browsing native programs
. browsing rust API
. browsing web3 API
. browsing solana-web3.js (javascript API)
. browsing about JSON RPC API
blairmunroakusa@0750.020722.anch.AK:bedroomstudy
. pushing update to gh
. read calling between programs
. read runtime section
. read accounts section
. read transaction section
. resuming programming model reading
```
```
blairmunroakusa@1828.020622.anch.AK:bedroomstudy
. now just reading dev intro and dev in rust page on solana.com (on-chain program section)
. reading 'Programming Model' section in documentation
. yanking escrow contract reference implementation
. getting situated with solana CLI
	. reading command-line guide
	. dialing in solana tool suite
	. OK
	. installing spl-token
	. OK
. digging into research, setting up working notes
```
```
blairmunroakusa@1231.020622.anch.AK:goldcouch
. creating new cargo crate payfract_node
. creating ref implementation directory
. brainstorming designdoc
. configuring readme / log
. repo init
```
