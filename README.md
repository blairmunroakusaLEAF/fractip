#### [..](https://github.com/blairmunroakusaBRANCH/blockchain.solana)
#### [ROOT](https://github.com/blairmunroakusa)
#### [TRUNK](https://github.com/blairmunroakusaTRUNK)
#### [BRANCH](https://github.com/blairmunroakusaBRANCH)
#### [LEAF](https://github.com/blairmunroakusaLEAF)

```
 Welcome to my Solana fractal/fractional payment project
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

. something like this probably already exists ... but ...
. the purpose of this project is to practice writing smart contracts in Rust
. this is to implement 'tip propagation' from primary source to secondary/tertiary sources
. idea is to set up one main account per piece or node, and one account per reference within the piece
```

```
There are several cases; here are the general ones:

1 - disconnected empty node
	. main piece with no references
	. only one account
	. main piece not cited by any upstream nodes
	. only direct payment

2 - disconnected full node
	. main piece with n references and m citations
	. n + m + 1 accounts per node
	. references not connected to reference nodes
	. main piece not connected to citing nodes

3 - connected full node
	. main piece with n references and m citations
	. n + m + 1 accounts per node
	. references connected to reference nodes
	. main piece connected to citing nodes
	
. the interface would be an little plugin that gives viewers ability to 
	click and tip for what they're reading/watching
. a click would allow operator to enter tip to xfer from personal solana
	account to main piece account
. if ref accounts as disconnected, then fraction of tip accumulates in said account
. if ref account is connected, then the fraction propagates to ref piece main account, and so on
```
```
Writing:

The object of this effort is to create a smart contract system that allows operators to
associate produced content with a solana account, then create two way links between
referenced and citing content. Two way links will be established by two solana accounts
that are unique to that particular link. This will solidify provenance, providing not
only propagating payments, but data about where those payments came from, and the ability
to reflect payment back up from payee to the payer.

	main	(ref piece for ->)					citing
	piece								piece

	piece		cite receive  <_______<	ref send		piece
	acct		account			account			acct




```

