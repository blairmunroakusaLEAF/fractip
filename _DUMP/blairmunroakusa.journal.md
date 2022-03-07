# JOURNAL

I am honing in on more complex troubleshooting. I need to start (should have started sooner) recording activities in journal.



DoNe

Got it...had to change numbers to big endian for BigNumber encoding.


changing numbers to big endian on server side.

blairmunroakusa@1653.030322.anch.AK:FT

.

.

.


FLAGS field is as should: big endian bitwise.

pubkey is as should, big endian nibble-wise.

numbers are all little endian. will fix



blairmunroakusa@1017.030322.anch.AK:redcouch

Verifying initialized account contents match intended data.

```
MAIN
Public Key: Ai3gQej2eyEpyDwugdjZPuZZoXfxigVKNGxmR67hJ86i
Balance: 0.0012528 SOL
Owner: F1qm8mwbVoapFVry9RYcA73DTgYADNkBYwc1MNx6ibH7
Executable: false
Rent Epoch: 0
Length: 52 (0x34) bytes
0000:   00 e0 02 cd  8e f4 f8 14  38 91 38 ee  1c 67 8e 60   ........8.8..g.`
0010:   43 52 0a 23  aa 7d 7d be  b1 1f fb 35  e4 24 e7 3a   CR.#.}}....5.$.:
0020:   76 4a 00 00  00 00 00 00  00 00 00 00  00 00 00 00   vJ..............
0030:   00 00 00 00                                          ....
```
```
PIECE
Public Key: 2iZEkyGVa2qmpSyPr1UDpecgrg4EW8Qwx1wUxfQ69cKQ
Balance: 0.00171912 SOL
Owner: F1qm8mwbVoapFVry9RYcA73DTgYADNkBYwc1MNx6ibH7
Executable: false
Rent Epoch: 0
Length: 119 (0x77) bytes
0000:   00 a0 02 cd  8e f4 f8 14  38 91 38 ee  1c 67 8e 60   ........8.8..g.`
0010:   43 52 0a 23  aa 7d 7d be  b1 1f fb 35  e4 24 e7 3a   CR.#.}}....5.$.:
0020:   76 4a 00 00  00 00 00 00  00 00 00 00  00 00 00 00   vJ..............
0030:   00 00 00 00  45 45 45 45  45 45 45 45  00 00 00 00   ....EEEEEEEE....
0040:   00 00 00 00  00 00 00 00  00 00 00 00  00 00 00 00   ................
0050:   00 00 00 00  00 00 00 00  00 00 00 00  00 00 00 00   ................
0060:   00 00 00 00  00 00 00 00  00 00 00 00  00 00 00 00   ................
0070:   00 00 00 00  00 00 00
```
```
REF
Public Key: 3UoskCmbJdUvSRdfh7DWweUrqjyZQDDMnN9Tx9nvpmPB
Balance: 0.00135024 SOL
Owner: F1qm8mwbVoapFVry9RYcA73DTgYADNkBYwc1MNx6ibH7
Executable: false
Rent Epoch: 0
Length: 66 (0x42) bytes
0000:   00 60 02 cd  8e f4 f8 14  38 91 38 ee  1c 67 8e 60   .`......8.8..g.`
0010:   43 52 0a 23  aa 7d 7d be  b1 1f fb 35  e4 24 e7 3a   CR.#.}}....5.$.:
0020:   76 4a a0 86  01 00 00 00  00 00 00 00  00 00 53 45   vJ............SE
0030:   4c 46 5f 52  45 46 45 52  45 4e 43 45  00 00 00 00   LF_REFERENCE....
0040:   00 00  
```
Account data sizes check out.

(cost to initialize account btw, is 0.00432216 SOL)

OH! ...byte array translated to ascii on right?

Yes, slug data checks out.

Other variable data checks out.



So far, here are some important troubleshooting tidbits I have discovered:
```
. pda seed are limited to 32 bytes
. if pda seed cannot derive pda, then invoke signed will fail something like this:
	. 'escalated signing privilege of <pda>'
	. 'failed because account lacks proper signing privileges'
. if DATA_LAYOUT doesn't match interface, script will stacktrace error with no feedback
```
