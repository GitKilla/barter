var Swap = artifacts.require("./Swap.sol");
var TestNFTContract = artifacts.require("./TestNFTContract.sol");

module.exports = function(deployer) {
  deployer.deploy(TestNFTContract, "Bobby", "Buckets");
  deployer.deploy(Swap);
};
