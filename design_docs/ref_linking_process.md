## REF LINKING PROCESS DRAFT

This is a draft process flow for case where cited references do not have accounts (ie, for a disconnected full node).

(!.x syntax indicates sub process that needs to be figured.)

(!!! indicates an influential thought)

(??? indicates a design wonder)

BEGIN

We have a piece, created by a creator, the to-be payfract operator.

To keep things simple, the piece is not cited.

But there are readers, enough to justify opening a payfract account to accept and propagate tips.

Creator opens a payfract PIECE account, becoming an operator.

Rent is expensive on Solana, so operator chooses top references to propagate tips to.

IE, a piece may have 100 references, but only 5-10 were influential enough to compel operator to share tips with.

Say in this case the operator only has 3 references they want to propagate tips to. Because these references were so influential, and because the operator is grateful and generous, the operator is motivated to go out of their way to share a fraction of their tip income.

!.1 Operator checks payfract registry and finds no prior ref listings.

!.2 Operator sets up 3 payfract REF accounts, one per reference. During setup, operator specifies what proportion of incoming tips should go to each ref.

The 3 payfract REF accounts are automatically linked to the operator's payfract PIECE account.

Each payfract REF account address is a ed22519 pubkey, where the operator keeps the prikey for invitation gifting to the ref creator.

!.3 Invitation gifting is a way to link payfract REF account with appropriate recipient, but under the stipulation that to receive  the proceeds in REF account, the creator must create a payfract CITE account for the original piece. In other words, for a piece creator to withdraw proceeds from a REF account, they must open a payfract CITE account for their piece, then link it to the charged REF account using the private key that the upstream operator gifted the downstream operator. 

!!! since rent is by volume, keeping accounts simple is key

??? does it make more sense to stash keys on chain or in wallet

Ideally the operator just has one private key per piece.

!!! Because of Sealevel, the entire payfract system only needs one program account for tip processing.

One option is to just have one wallet per piece. The wallet consists of three types of keys: n REF keys (reference accounts), 1 PIECE key (piece account), and m CITE keys (accounts to receive upstream REF account payments).

For now let's just call a wallet == file containing private keys. Perhaps an operator can manage multiple pieces using a piece book, which is a collection of piece wallets, all linked to a Solana main account of the operator's choosing (for collecting funds).

??? Okay, so in terms of data store... each account will hold one public key. The REF public key will be used for CITE downstream account linking. The PIECE public key will be used for ? 
