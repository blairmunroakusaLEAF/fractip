blairmunroakusa@0634Fri.11Mar22.anch.AK:

# FracpayPIECE function outline

Client will issue loop of txs, where each tx transfers portion of PIECE lamports to disconnected REF, or to target PIECE for connected REF.

In case of client loop interruption, fracpay flipflop flag in each REF will sync with PIECE flipflop flag. Flag will flip after REF is paid. If interruption occurs, FracpayPIECE will resume at last flipped REF flag. After completion, PIECE flipflop flag will flip, indicating PIECE is ready for new fracpay instruction. Ie, the indication will be apparent by the fact that all flipflop flags will match. The server will only neet to compare three flags--the current REF, the self REF, and the PIECE. The client will sweep the range of REFs on function entry. If the self REF flag is flipped, but following REFs are flopped, then the client knows the last attempt at a fracpayment was interrupted, and resumes paying out where it left off. If all flags are the same, then the PIECE is ready for a new fracpayment. If self is flipped, all other REFs are flopped, and PIECE is flipped, then the final fracpayment tx pays out the remaining balance to self REF target, and flops self REF and PIECE to match all other flopped REFs to indicate the PIECE has been reset and is ready for a new fracpayment.

NEED TO SIMPLIFY ABOVE TO ALLOW PARALLEL TX???

OPTION IS TO COMPARE ALL FLIPFLOP FLAGS TO SELF REF AND PIECE, WHICH ARE ONLY EVER FLIPPED TOGETHER. WHATEVER FLIPFLOP THEY'RE IN IS OPPOSITE TO WHAT COMPLETED REF TXS SHOULD FLIPFLOP TO. CLIENT COMPARES REF FLIPFLOPS TO PAIR AND BATCHES TX INSTEAD OF LOOPING UNTIL ALL FLAGS ARE FLIPPED OPPOSITE. THEN THE LAST TX IS SENT TO PAY SELF AND RESET. THE ONLY PROBLEM IS THAT SOLANA PROGRAM MAY NOT ALLOW MULTIPLE TX TO TRANSFER LAMPORTS SIMULTANEOUSLY BECAUSE I AM PRETTY SURE THIS IS DEFINITELY A WRITE FUNCTION. 

NO...THE ABOVE PARAGRAPH WILL NOT WORK. IT STILL MAY BE FASTER TO LET RUNTIME HANDLE THE TX SERIALIZATION. ...OR, SOLANA TX RATE IS FAST ENOUGH FOR THIS TO BE NEGLIGABLE...AND WE JUST DROP ASYNC AWAIT.

```
CALCULATION...THEORETICAL BEST:

TPS (from FMsolana) hovering at about 500

at current spec, MAX TX TIME = 65500/500 = 131s, no failures

now, failure rate is ~ 25% (50 mil in 200 mil)  ADJUSTED MAX TX TIME = 180

so three minutes, with no competition
```


The reason we need the flipflops, and not just a simple true/false is because we need to accomodate fracpayments at scale, with prototype design allowing for ~ 65500 individual REFs for a PIECE (think, payment distribution for a small town from an organization for example). Flipflops allow us to avoid needing to reset flags. To reset 65500 flags would require too many tx in addition to the 65500 tx needed to carry out the fracpayment.

What happens if a fracpayment was interrupted, then a new incoming fracpayments comes in from a REF inbetween? In principle, this risks overpaying certain REFs when the fracpayment is completed later. This is pretty easy to get around, but a little messier. More flags!! :D We just need to include a 'busy' flag in the PIECE. When the flag is set paying (during a fracpayment), any incoming payments will still be deposited. The caveat is that the balance will not be changed. At the end of the fracpayment, before resetting the busy flag to zero, the program will check the lamports balance minus the rent to see if it is zero. If not, then a payment was received during the fracpayment fracture. The netsum is incremented by the balance per normal case, but the balance is also incremented by the current lamport balance. There is no way that the deposit will interfere with the payout, because the net is guaranteed to be positive.

blairmunroakusa@1906Thu.24Mar22.anch.AK:FT

BUSY FLAG MUST BE SET LOW BEFORE ANY PAYMENT ABORTION!  Is this feasible?

FOR ONCHAIN ABORTION, ERROR PASSING/UNWIND NEEDS TO CHANGE BUSY FLAG LOW. Is this even possible?

NO! THIS IS ABSURD...a tx failure will only fail that one tx.

busy flag will be a shortcut to checking whether or not all flags are flipped or flopped.

blairmunroakusa@1907Thu.24Mar22.anch.AK:FT

For this function, PIECE balance is critical, whereas only netsum is critical in REFs. A REF can only have a single netsum for a single invite key. At REF linking, when the invite key is proferred, netsum will represent lamport accumulate from start, or zero. After linking, lamports will never accumulate in a REF account, because they forward to the target address. The netsum however, will continue to increase, representing the net sum of lamports paid through a given REF.

The PIECE balance is important because the account's lamports balance will decrease to zero as each REF is paid out. The only secure way to calculate the transfer amount for a given REF however, is to compute this onchain, during server program execution. Balance increase incrementally from zero as payments come in to PIECE. When a fracpayment is executed, balance is used to compute portion to transfer. Only after fracpayment is complete is balance renintialized to zero. Balance will also indicate to the operator how much they stand to draw if they with to force a fracpayment from their PIECE to collect their share. Additionally, a balance variable makes it easy to forget about the rent tied up in a account.

Eventually, there will be a reflect fracpayment function. This will make it so that an operator can decline to accept fracpayments from a particular PIECE. For each fracpayment tx, server will check reflection flag and if high, will transfer that portion to the target in the PIECE self REF instead.

On the client side, there are only two ways to initiate a fracpayment:

1 - fracpay a PIECE directly

2 - collect portion of current balance in PIECE

These are two cases of transfer amount between operator and PIECE: zero, and positive. In the zero case, all the operator wants to do is propagate a fracpayment for a particular PIECE, without contributing anything to the PIECE balance. They incur the tx fees. In the positive case, the operator wants to pay a PIECE because they have received some value from it. A fracpayment of their contribution plus the current balance is issued. Note that the PIECE balance variable only ever reflects fracpayment portions coming from upstream REFs.

Both cases can be handled using the same function, for they both involve a PIECE, and a payment amount (>=0)

Ok...rundown.

Client gets PIECE and payment amount. 0 is 'I just want the money to flow' and + is 'I am contributing to the fracpayment'.

Client derives address bump pairs for all REFs.

Client checks PIECE & REFs to make sure flipflops are all same and busy flag is low.

If not, client makes note that prior fracpayment needs completing first.

Client scans for REFs with opposite flag, and checks PIECE for nonzero balance, and lamport balance.

Client sends a batch of parallel tx requests, returning promise with errors somehow.

Client repeats scan until all flags opposite, then sends final tx 




BUSY FLAG IS DIFFICULT

If busy, it is a race to make the payment by client.

If other client is in middle of transfer, then the race client checks flag but clear so tx fails.

If other client is finished with transfer, then the raace client checks flag but not clear so tx aborts.

On chain needs to set flag to notclear right after processing transfer, so that any competing clients are guaranteed to fail.

This is mostly on chain


