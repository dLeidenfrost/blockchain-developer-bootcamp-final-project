const ClothingExchange = artifacts.require("./ClothingExchange.sol");

module.exports = function (deployer) {
  deployer.deploy(ClothingExchange);
};
