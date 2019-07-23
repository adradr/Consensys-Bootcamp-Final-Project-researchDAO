const SafeMath = artifacts.require("SafeMath");

module.exports = function(deployer) {
    deployer.deploy(SafeMath);
  };