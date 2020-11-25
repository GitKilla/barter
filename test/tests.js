const Swap = artifacts.require("../contracts/Swap.sol");
const TestNFTContract = artifacts.require("../contracts/TestNFTContract.sol");

contract("Swap", accounts => {


  it("...should properly swap ownership of traded NFT assets.", async () => {

    const swap = await Swap.deployed();
    const erc721 = await TestNFTContract.deployed();

    await erc721.mine(accounts[0],1, {from:accounts[2]})
    await erc721.mine(accounts[0],2, {from:accounts[2]})
    await erc721.mine(accounts[1],3, {from:accounts[2]})
    await erc721.mine(accounts[1],4, {from:accounts[2]})

    // add test nft contract to whitelisted NFT contracts
    await swap.approveNFT(erc721.address, {from:accounts[0]})

    // set approval for swap contract to move account 0 and 1's NFTs
    await erc721.setApprovalForAll(swap.address,true, {from:accounts[0]})
    await erc721.setApprovalForAll(swap.address,true, {from:accounts[1]})

    // add swap offer from account 0
    await swap.addOffer([1,2]
      ,[erc721.address,erc721.address]
      ,[3,4]
      ,[erc721.address,erc721.address]
      ,0
      ,0
      ,accounts[1]
      , {from:accounts[0]})

    // accept offer from account 1
    await swap.acceptOffer(0, {from:accounts[1]})

    // get NFT owners post-swap
    var owner1 = await erc721.ownerOf(1)
    var owner2 = await erc721.ownerOf(2)
    var owner3 = await erc721.ownerOf(3)
    var owner4 = await erc721.ownerOf(4)

    // verify the assets have successfully swapped ownership
    assert.equal(owner1, accounts[1])
    assert.equal(owner2, accounts[1])
    assert.equal(owner3, accounts[0])
    assert.equal(owner4, accounts[0])

  });

  
  it("...should not allow user to add offer with assets they don't possess.", async () => {

    const swap = await Swap.deployed();
    const erc721 = await TestNFTContract.deployed();
    try {
      await swap.addOffer([1,2]
        ,[erc721.address,erc721.address]
        ,[3,4]
        ,[erc721.address,erc721.address]
        ,0
        ,0
        ,accounts[1]
        , {from:accounts[0]})
      throw null
    } catch (error) {
      const errorString = "VM Exception while processing transaction: ";
      assert(error, "Expected a VM exception but did not get one");
      assert(error.message.search(errorString) >= 0, "Expected an error starting with '" + errorString + "' but got '" + error.message + "' instead");
    }
    
  });

  it("...should not allow user to accept offer with assets they don't possess.", async () => {

    const swap = await Swap.deployed();
    const erc721 = await TestNFTContract.deployed();

    await swap.addOffer([3,4]
      ,[erc721.address,erc721.address]
      ,[1,2]
      ,[erc721.address,erc721.address]
      ,0
      ,0
      ,accounts[1]
      , {from:accounts[0]})

    await erc721.safeTransferFrom(accounts[1], accounts[2], 1, {from:accounts[1]})

    try {
      await swap.acceptOffer(1, {from:accounts[1]})
      throw null
    } catch (error) {
      const errorString = "VM Exception while processing transaction: ";
      assert(error, "Expected a VM exception but did not get one");
      assert(error.message.search(errorString) >= 0, "Expected an error starting with '" + errorString + "' but got '" + error.message + "' instead");
    }
    
  });

  it("...should make offers for any address available.", async () => {

    const swap = await Swap.deployed();
    const erc721 = await TestNFTContract.deployed();
    var x = await swap.offersByAddress.call(accounts[1], 0)
    assert.equal(x, 0)
    
  });

  it("...should properly return total offers per address", async () => {

    const swap = await Swap.deployed();
    const erc721 = await TestNFTContract.deployed();
    var x = await swap.offerCountByAddress.call(accounts[1])
    assert.equal(x, 2)
    
  });

  it("...should properly close offers as they are accepted.", async () => {

    const swap = await Swap.deployed();
    const erc721 = await TestNFTContract.deployed();
    var x = await swap.offers.call(0)
    assert.equal(x['state'], 1)
    
  });

  it("...should not allow offers for non-whitelisted NFT contracts.", async () => {

    const swap = await Swap.deployed();
    const erc721 = await TestNFTContract.deployed();

    try {
      await swap.addOffer([3,4]
        ,[swap.address,swap.address]
        ,[1,2]
        ,[swap.address,swap.address]
        ,0
        ,0
        ,accounts[1]
        , {from:accounts[0]})
      throw null
    } catch (error) {
      const errorString = "VM Exception while processing transaction: ";
      assert(error, "Expected a VM exception but did not get one");
      assert(error.message.search(errorString) >= 0, "Expected an error starting with '" + errorString + "' but got '" + error.message + "' instead");
    }
    
    
  });

  it("...should properly pass fee to owner.", async () => {

    const swap = await Swap.deployed();
    const erc721 = await TestNFTContract.deployed();

    // swap.defaults({gasPrice:0})

    await erc721.mine(accounts[4],5, {from:accounts[2]})
    await erc721.mine(accounts[4],6, {from:accounts[2]})
    await erc721.mine(accounts[5],7, {from:accounts[2]})
    await erc721.mine(accounts[5],8, {from:accounts[2]})

    // set approval for swap contract to move account 0 and 1's NFTs
    await erc721.setApprovalForAll(swap.address,true, {from:accounts[4]});
    await erc721.setApprovalForAll(swap.address,true, {from:accounts[5]});

    await swap.setFee('1000000000000000000', {from:accounts[0]});
    const initialBalTrader = (await web3.eth.getBalance(accounts[5]))
    const initialBalOffer = (await web3.eth.getBalance(accounts[4]))
    const initialBalOwner = (await web3.eth.getBalance(accounts[0]))

    // add swap offer from account 0
    var receipt1 = await swap.addOffer([5,6]
      ,[erc721.address,erc721.address]
      ,[7,8]
      ,[erc721.address,erc721.address]
      ,'1000000000000000000'
      ,0
      ,accounts[5]
      , {from:accounts[4], value:'2000000000000000000'})

    // calculate gas paid on transaction, I ended up just setting gas to 0 so this does not work
    const tx1 = await web3.eth.getTransaction(receipt1.tx);
    const gasPrice1 = tx1.gasPrice;
    const gasUsed1 = receipt1.receipt.gasUsed;

    // accept offer from account 1
    var receipt2 = await swap.acceptOffer(2, {from:accounts[5], value:'1000000000000000000'});
    const intBalTrader = (await web3.eth.getBalance(accounts[5]))

    // calculate gas paid on second transaction, I ended up just setting gas to 0 so this does not work
    const tx2 = await web3.eth.getTransaction(receipt2.tx);
    const gasPrice2 = tx2.gasPrice;
    const gasUsed2 = receipt2.receipt.gasUsed;

    // get NFT owners post-swap
    var owner1 = await erc721.ownerOf(5)
    var owner2 = await erc721.ownerOf(6)
    var owner3 = await erc721.ownerOf(7)
    var owner4 = await erc721.ownerOf(8)

    newBalOffer = (await web3.eth.getBalance(accounts[4]))
    newBalTrader = (await web3.eth.getBalance(accounts[5]))
    newBalOwner = (await web3.eth.getBalance(accounts[0]))


    // verify the assets have successfully swapped ownership
    assert.equal(owner1, accounts[5])
    assert.equal(owner2, accounts[5])
    assert.equal(owner3, accounts[4])
    assert.equal(owner4, accounts[4])

    // Verify the proper values are in each of the accounts
    // +1ETH received in offer -1ETH fee for person who was offered the trade (trader)
    // -1ETH offered -1ETH fee for offerer
    // +2 ETH for owner 
    assert.equal(parseFloat(initialBalTrader), parseFloat(newBalTrader))
    assert.equal(parseFloat(initialBalOffer), parseFloat(newBalOffer)+parseFloat('2000000000000000000'))
    assert.equal(parseFloat(initialBalOwner)+parseFloat('2000000000000000000'), parseFloat(newBalOwner))

  });

});
