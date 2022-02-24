blairmunroakusa@1546.022122.anch.AK:FT

Writing after taking 6 days of break doing Solidity javascript CTF stuff.

So, after interacting with zicklag, I've determined that my design issues really are as simple as linking a wallet by signing, and keeping the elements cellular and simple.

So reviewing design in terms of costs: primary costs are rent and tx fees, rent being the most costly upfront, and scaling, for the piece implementer. Tx fees being costly when scaling, for the tippers. For example, using payfract to distribute royalties to members of multithousand person orgs could become prohibitively costly, at least at the micro tx level...for such cases, it may be prudent to install a threshold 'payout level', where if a tipper's contribution is small enough, they are exempt from propagation obligations. Or, to circumvent the issue entirely, perhaps it will be solely up to the piece owner to propagate tips when pulling funds. In any case, the piece owner will need to propagate before withdrawing.

Let's walk through the flow:
```
1 - I create operator main account for myself.

. create pda from owner's pubkey
. require that any additional action require owners's signature
. derive operator self account from pubkey + 


.....


Nah... switching over to working on a pseudocode implementation

blairmunroakusa@1625.022322.anch.AK:greenchair
