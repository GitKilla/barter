There are a few main attacks that are most applicable to my project; reentrancy, state machine manupulation, and simply general bug exploits.

1. Reentrancy - The most vulnerable point of my contract from a reentrancy perspective is that there are no balances tracked, simply offers. This means if there was a way to recursively cancel an offer, or accept one that you do not have to pay for, etc. a user could drain the balance of the contract that had been built up from others posting offers that include ETH. This is protected against in a couple main ways:
    -Immediately after checking an offer for being Active, it is set as closed. If a reentrancy attack were to attempt to access the same offer after this offer was closed, they would be unable to access it as the require statement for an active offer would fail. 
    -Additionally, the 'transfer' method is used for Ether instead of directly calling the default callback function. Transfer sets a gas limit on the default function, meaning malicious contracts can't do anything complex within their default function or the transaction will fail.

2. State machine manipulation - Anytime an offer is referenced to change state, the offer is required to be Active. Immediately after state is changed, the offer becomes closed, whether it was an offer being accepted or canceled. This prevents malicious actors from accepting the same offer multiple times or cancelling to return their ETH multiple times. Anytime they add ETH to the contract, it will be passed to one person at most and subsequently made invalid.

3. Bug exploits - I have added a number of potential preventative measures to make sure the contract works as intended. One example is that I require people to specify an address to trade with, so only a specific address can accept an offer. A user also must own all NFTs that he tries to create an offer with, and accepting an offer when the offerer has offloaded his NFTs will fail. Generally, the offer will only go through if all transfers of an offer can successfully execute.