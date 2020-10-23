module.exports = async (callback) => {

    var erc721 = await NFTContract.at(NFTContract.address)
    erc721.mine(accounts[0],1, {from:accounts[2]})
    erc721.mine(accounts[0],2, {from:accounts[2]})
    erc721.mine(accounts[1],3, {from:accounts[2]})
    erc721.mine(accounts[1],4, {from:accounts[2]})
    erc721.mine(accounts[0],5, {from:accounts[2]})
    erc721.mine(accounts[0],6, {from:accounts[2]})
    erc721.mine(accounts[0],7, {from:accounts[2]})
    erc721.mine(accounts[1],8, {from:accounts[2]})
    erc721.mine(accounts[1],9, {from:accounts[2]})

    callback()
}