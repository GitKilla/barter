var Swap = artifacts.require("./Swap.sol");
var TestNFTContract = artifacts.require("./TestNFTContract.sol");

module.exports = function(deployer) {
  deployer.deploy(TestNFTContract, "Axie", "Infinity");
  deployer.deploy(TestNFTContract, "Sandbox", "Land");
  deployer.deploy(TestNFTContract, "Decentraland", "Land");
  deployer.deploy(Swap);
};
