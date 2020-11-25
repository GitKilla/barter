<h1>About</h1>

This project is an NFT trading interface that allows people to create trades with other addresses that include both NFTs and ETH, similar to how one would have traded in a runescape or rocket-league type interface. This is specifically distinct from the OpenSea type marketplace where users are selling one NFT typically for a specific price or via auction, and is instead a way to create offers that incorporate both ETH and multiple NFTs (likely best for low-value NFTs where price discovery is not the most significant problem to be solved).

It does this by allowing users to create an 'offer', which is a combination of NFT IDs and Ether that the user has as well as that another address has, and posting it to Ethereum. Once an offer is created, only the target address can send a transaction to accept the offer. Once the offer is accepted, the Swap contract (given proper access) can transfer all of the agreed upon NFTs from one account to the other, as well as any ETH that was involved. This offer is then moved from Active to Closed, and there is no way to resurrect this offer once it is moved to the closed state. There are also a lot of getter functions in the Swap contract to ease the front-end development that are not necessary to understand.

<h1>Directory Structure and Setup</h1>

This project is born out of the truffle unbox react command so it has a truffle directory structure on the outside (for folders like build, scripts, test, and migrations), while the client folder houses the necessary user interface. 

To migrate the contracts to your ganache blockchain use the command in the barter directory:

    truffle migrate --reset

The truffle setup is configured to migrate the contracts to port 8545. You will then want to copy the contract addresses for both the TestNFTContract and Swap and paste them in their respective slots in App.js lines 68-71. **Keep these contract addresses for later because you will need them to run truffle console commands below.**

The user interface can be then be launched in a development environment via the command in the barter directory:

    npm run start

This will launch the app at localhost:3000

<h1>Post-Launch Tips</h1>

Once the contracts have been deployed and the user interface has successfully interfaced with them, there are a few project specific requirements that you will need to fulfill in order to start trading NFTs:

1. Make sure when you start your local ganache chain that it is on port 8545, and that the gas price is set to 0 in the chain section of options (if this is not set to 0, one of the tests will fail.) 

2. The Swap contract must whitelist the TestNFTContract using approveNFT. This can be done via truffle console with the following commands (these should be the only commands you need to run from console, the rest can be done through the GUI):

`var axie = await TestNFTContract.at(*INSERT FIRST NFT CONTRACT ADDRESS HERE*)`
`var tsb = await TestNFTContract.at(*INSERT SECOND NFT CONTRACT ADDRESS HERE*)`
`var dcl = await TestNFTContract.at(*INSERT THIRD NFT CONTRACT ADDRESS HERE*)`
`var swap = await Swap.at(Swap.address)`
`swap.approveNFT(axie.address, {from:accounts[0]})`
`swap.approveNFT(tsb.address, {from:accounts[0]})`
`swap.approveNFT(dcl.address, {from:accounts[0]})`

3. You will need to approve the Swap contract for use of your NFTs. This can be done via the APPROVE TRADING button that will show up only if you have not approved the contract

4. You will need to mint your own NFTs to your address and another address so that you have items to trade. This can be done by pressing the two doggy bags in the top left corner of the react page, which will generate a random NFT (framed as Axie infinity's for the purpose of this project) and mint it to your address. 

Once these steps are complete you should be able to create offers via the propose trade button, and accept and cancel offers by clicking on the 'offers' button in the top right.