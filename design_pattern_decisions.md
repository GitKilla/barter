I used three design patterns for this project:

1. Restricting Access - I created an onlyOwner modifier that is used for various admin operations such as determining which NFT contracts are allowed to be included in Swaps as well as halting the Swap contract in the event of an emergency.

2. Circuit Breaker - I created a stopped public boolean and included it as a requirement in a stopInEmergency modifier that allows swap offer creation and acceptance to be halted in the event of a hack. This is buttressed by the onlyOwner modifier as mentioned earlier.

3. State Machine - I created a very simple state machine design pattern that essentially moves Offers from Active to Closed when they are created and subsequently accepted or canceled by one of the two participants. Offers can only be executed if they are open, and can never be moved from closed to open. 

In retrospect, I think this application may work better with an off-chain orderbook and a contract that can simply swap given IDs. In the case of an on-chain orderbook, users need to send transactions to the contract in order to cancel orders, which is expensive. That being said, it is definitely less centralized and puts less control into the hands of the interface owners.