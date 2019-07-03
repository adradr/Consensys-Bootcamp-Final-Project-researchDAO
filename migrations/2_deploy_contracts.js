const researchDAO = artifacts.require("researchDAO");

module.exports = function(deployer) {
  deployer.deploy(researchDAO);
};