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
  applicant: secondMember,
  title: "First member application for testing",
  documentationAddress: "0x0",                        // Empty document
  fundingGoal: 10,
  sharesRequested: 10                               // as much the initial summoner received

}

const proposalForResearch = {
  title: "First research proposal for testing",
  documentationAddress: "0x0",  // Empty document
  fundingGoal: 10
}

//rDAO.deployed().then(a => { rdao = a; })
// const rdao =  rDAO.deployed();
// console.log(rdao);
//const rdao = await rDAO.deployed();

const truffleContractAddress = '0x9c4077d6422A0C85001DB1De70E80204B64ce65e';
var rdao;
beforeEach('deployment for each test', async function() {
  rdao = await rDAO.at(truffleContractAddress);
  //console.log("beforeEach...", rdao.address);
});

// Is it deployed properly
it("rdao should be deployed at address: " + rDAO.address, async () => {
  //const rdao = await rDAO.deployed();

  //console.log("rdao: ", rdao.address, "\nrDAO: ", rDAO.address);
  assert.isTrue(rdao.address == truffleContractAddress); //rDAO.address, "rDAO address is not found");
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
    proposalForNewMember.applicant,
    proposalForNewMember.title,
    proposalForNewMember.documentationAddress,
    proposalForNewMember.fundingGoal,
    proposalForNewMember.sharesRequested
  );
  //console.log(submission);

});

it("submit proposal for research", async () => {

});


});
