const researchDAO = artifacts.require("researchDAO");
const deploymentParams = require('../deployment-params.js')

module.exports = function(deployer) {
  deployer.deploy(
    researchDAO,
    deploymentParams.VOTING_PERIOD,
    deploymentParams.RAGEQUIT_PERIOD,
    deploymentParams.PROPOSAL_DEPOSIT,
    deploymentParams.PROCESSING_REWARD,
    deploymentParams.INITIAL_SUMMONER_SHARES,
    deploymentParams.TOKENS_PER_ETH_DEPOSITED
    );
};