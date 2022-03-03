#### [..](https://github.com/blairmunroakusaBRANCH/blockchain.solana)
#### [ROOT](https://github.com/blairmunroakusa)
#### [TRUNK](https://github.com/blairmunroakusaTRUNK)
#### [BRANCH](https://github.com/blairmunroakusaBRANCH)
#### [LEAF](https://github.com/blairmunroakusaLEAF)

So far this project is in coding and testing phase.

Most of the chaos is in the DUMP.

_Fractal like a lightning bolt..._

![Fractal like a lightning bolt.](./pics/lightning.webp)

##### ABOUT FRACPAY:

I actually think 'fracpay' is the fitting name; the big idea is to create a distributed application that can propagate fractal payments.

(I have chosen to use the Solana blockchain due to its relatively high tx processing rate, and low tx fees. Because blockchain tx rate is in general scale-limited to be proportional to the network's throughput (?~80% confidence in assertion), a distributed ledger technology that is based in directed acyclic graph technology is probably necessary for scaling en masse (DAG network tx rates are proportional to number of network nodes/agents, not network throughput.) )

Imagine, I have a blog post outlining this project as a reference implementation for fellow Solana developers writing their own dApp. In a general sense, I think money is cool, and that the world is a better place when more people get paid for their efforts. I want to share my gratitude with the people who influenced the course of this fracpay project, and naturally I cite these sources as reference. Then naturally, I set up a 'tip jar' at my blog post, using the fracpay system.

This tip jar is special. If somebody likes the fracpay project as a reference implementation, and they find it valuable enough, they can express this by making a fractip at the blog post. They click on the listed pubkey for the piece, and this takes them to a webapp (or maybe just a popout) that allows them to link their wallet containing SOL.

After linking their wallet, they transfer some SOL to the 'tipjar' (fractipping the PIECE), and the client propagates the fractip to any listed references with the piece. For example, I may allot 15% of any fractip to the PaulX Escrow reference implementation. I would allot 5% to the 'Create your own Twitter dApp' reference implementation. I would allot 10% to zicklag from the solana Forum. Etc. Whatever portion of the fractip is left over, would be kept for myself, or forwarded to some other entity or cause, Perhaps in this case I would be tempted to point it toward a wallet devoted to helping Ukranian refugees.

If any of the cited references are in the fracpay system and have references of their own, the incoming tip money from my blog piece will be propagated to _their_ references the next time somebody fractips that piece directly, or the piece operator (owner) wishes to withdraw SOL. Hence, as the network grows, payments will become fractal over discrete time.

I think fracpay is a better name, because a network/system like this could be most useful at the oragizational level. How do we distribute income to project collaborators, then those collaborators number in the thousands? Etc. (I could ramble a lot in this direction, but I will save it for another piece.)

_Fractal like a river (but reversed)..._

![Fractal like a river (but reversed).](./pics/tributary.jpg)

#### Some aspects of the fracpay system design are of interest:

1. References can be reserved. If I cite a bunch of references for my fracpay piece, they don't need to be in the system for me to start diverting fractions of incoming payments to them. Their reference will have an account that accumulates SOL, and a public key stored. The private key is an invitation. If I think the reference is worthy enough, I will be motivated to track down the person I am citing, and give them their invitation private key. If they wanted to collect the SOL waiting for them, they would create their own account and piece (cited piece), then link that piece to their reference account (by proffering the invitation key) which will divert all past and future SOL to their piece. If I can't find a person, then their reference account will just accumulate SOL, and the hope would be that said person eventually finds their reference account and approaches me for their invite key.

2. Pieces have a self reference account, and main accounts have a self piece account. If somebody creates an account with fracpay, they automatically create a self piece which represents them as an individual. This means that individuals can be generally cited and paid, without necessarily needing a specific piece to attribute the payment/reference to. Self reference accounts make it possible for reference recipients to 'reflect' payments back to the originating piece. Self reference accounts are also the mechanism for diverting remaining fracpay funds to the operator (owner) main account, or to a beneficiary's account. If the beneficiary is not linked, then like the regular account, the self reference will simply accumulate SOL.

3. As designed, an operator may have u16MAX (~65000) unique pieces. Likesiwe, a piece may have the same u16MAX number of unique references. Each piece has a 63 character slug for identification (for potential domain/sub space representation). Each reference has a 16 character slug for identifying unlinked reference accounts (this is mainly a convenience, for once linked, the linked piece identification slug will be used instead). All information needed to represent and crawl the network lives on-chain, with no need for an external database. The account and account data structure is meant to make rent affordable, and resource allocation (memory for storing piece/reference data) dynamic.

4. ALL accounts in the fracpay network are owned by the fracpay program. It is a closed system.

5. Each operator main account address is generated by a chosen unique operator ID under 63 characters, and this ID is stored in the operator self piece account data. At creation, the linked wallet pubkey is dedicated (stored) in the main account, and each ensuing piece account that the operator creates. Any modification of any of the associated main, piece, and reference accounts will need the wallet key to sign. To find their account, the operator must provide their ID to generate the address. Then, if they wish to modify, they must provide their wallet keypair. This is meant to make it possible to change the authority wallet, should the operator have a different wallet they wish to use after creating an account.

6. Each account (piece and reference, self and otherwise) keeps a net balance. In other words, each account has a little counter. By using the refrence fractions and the net balance information, we can compute how much and where money is going, a crude memory in a crule world where memory is inordinately expensive

_Fractal like blood vessels..._

![Fractal like blood vessels.](./pics/blood.jpg)

I don't know if a project quite like this exists elsewhere, and I don't really care because this is more of an exercise. The primary startup cost to get this on mainnet is program account rentexemption, which I expect to cost around 400$ all-said, my time, and some of my wp.computer domain space/netlify bandwidth. My ambition is the get a skeleton working prototype slapped together.

