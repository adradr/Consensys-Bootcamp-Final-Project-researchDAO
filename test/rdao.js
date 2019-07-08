// TTD Roadmap
// 0. Is the contract deployed at its address?
// 1. What parameters was the contract deployed with?
// 2. submitProposal() - proposal for new membership
// 3. submitProposal() - proposal for research
// 4. submitVote() - voting on a given proposal
//              - membership
//              - research
// 5. processProposal() - closing a proposal, vote counting, reward and fund distribution or reverting
// 6. rageQuit() - exiting guild during rage quit period after vote closes


// IMPLEMENT SIMILAR
// async function submitProposal (receiver, amount) {
//   return rdao.submitProposal(receiver, amount, { from: deployer })
// }

// truffle-test-utils helps to assert events
require('truffle-test-utils').init();
/*
// Regular call thanks to Truffle
// Example code
let result = await testedSmartContract.testedFunction();
// Check event
assert.web3Event(result, {
  event: 'TestedEvent',
    args: {
      param_1: 'Some value',
      param_2: 0x123456 // No need for toNumber hassle
  }
}, 'The event is emitted'); */


var rDAO = artifacts.require("researchDAO");
// importing to test if constructor values are applied correctly in deployed contract
const deploymentParams = require('../deployment-params.js')


// CONTRACT
contract("rDAO", function(accounts) {

const BN = web3.utils.BN      // BigNumbers library - might not need it

// Setting up test variables for accounts and proposal bodies

const summonerAddress = accounts[0];
const secondMember = accounts[1];
const thirdMember = accounts[2];
const fourthMember = accounts[3];

const proposalForNewMember = {
  isProposalOrApplication: false,
  applicant: secondMember,
  title: "Member application for testing",
  documentationAddress: "0x0",   // Empty document
  fundingGoal: 0,
  sharesRequested: 10            // as much the initial summoner received based on deploymentParams.INITIAL_SUMMONER_SHARES

}

const proposalForResearch = {
  isProposalOrApplication: true,
  applicant: secondMember,      // Solve to allow empty or null address as input
  title: "Research proposal for testing",
  documentationAddress: "0x0",  // Empty document
  fundingGoal: 10,
  sharesRequested: 0
}

// This is copied from truffle. It is the created researchDAO contract instance address
var truffleContractAddress = "";
truffleContractAddress = "0x085A82E375A39A47e3c390dC6D0F7b52a95149Cd";
var rdao;
beforeEach('deployment for each test', async function() {
  if (truffleContractAddress == "") {
    rdao = await rDAO.deployed();
  }
  else {
    rdao = await rDAO.at(truffleContractAddress);
  }


});

// Is it deployed properly
it("rdao should be deployed at address: " + rDAO.address, async () => {
  //const rdao = await rDAO.deployed();

  //console.log("rdao: ", rdao.address, "\nrDAO: ", rDAO.address);
  assert.isTrue(rdao.address == (truffleContractAddress == "" ? rDAO.address : truffleContractAddress)); 
});

it("contract global variables should match constructor values", async () => {
  //const rdao = await rDAO.deployed();

  let globalVotingPeriod = await rdao.globalVotingPeriod.call();
  let globalRagequitPeriod = await rdao.globalRagequitPeriod();
  let globalProposalDeposit = await rdao.globalProposalDeposit();
  let globalProcessingReward = await rdao.globalProcessingReward();
  let initialShares = await rdao.rDAO_totalShareSupply();
  let globalTokensPerDepositedETH = await rdao.globalTokensPerDepositedETH();

  assert.equal(globalVotingPeriod, deploymentParams.VOTING_PERIOD, "rDAO::constructor values are not forwarded correctly for deployment - voting period");
  assert.equal(globalRagequitPeriod, deploymentParams.RAGEQUIT_PERIOD, "rDAO::constructor values are not forwarded correctly for deployment - ragequit period");
  assert.equal(globalProposalDeposit, deploymentParams.PROPOSAL_DEPOSIT, "rDAO::constructor values are not forwarded correctly for deployment - proposal deposit");
  assert.equal(globalProcessingReward, deploymentParams.PROCESSING_REWARD, "rDAO::constructor values are not forwarded correctly for deployment - processing reward");
  assert.equal(initialShares, deploymentParams.INITIAL_SUMMONER_SHARES, "rDAO::constructor values are not forwarded correctly for deployment - initially summoned shares");
  assert.equal(globalTokensPerDepositedETH, deploymentParams.TOKENS_PER_ETH_DEPOSITED, "rDAO::constructor values are not forwarded correctly for deployment - tokens per ETH deposited");

});



it("submit proposal for new membership", async () => {
  //const rdao = await rDAO.deployed();
  let submission = await rdao.submitProposal(
    proposalForNewMember.isProposalOrApplication,
    proposalForNewMember.applicant,
    proposalForNewMember.title,
    proposalForNewMember.documentationAddress,
    proposalForNewMember.fundingGoal,
    proposalForNewMember.sharesRequested
  );

  // ToDo assert if values are correct

  assert.equal();

});

it("submit proposal for research", async () => {
  let submission = await rdao.submitProposal(
    true, //proposalForResearch.isProposalOrApplication,
    proposalForResearch.applicant,
    proposalForResearch.title,
    proposalForResearch.documentationAddress,
    proposalForResearch.fundingGoal,
    proposalForResearch.sharesRequested
  )

  // ToDo assert if values are correct


});

it("vote on proposal", async () => {



});

});
