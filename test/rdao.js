// TTD Roadmap
// 0. Is the contract deployed at its address?
// 1. What parameters was the contract deployed with?
// 2. submitProposal() - proposal for new membership
// 3. submitProposal() - proposal for research
// 4. submitVote()  - voting on a given proposal
//                  - membership
//                  - research
// 5. processProposal() - closing a proposal, vote counting, reward and fund distribution or reverting
// 6. rageQuit() - exiting guild during rage quit period after vote closes

var researchDAO = artifacts.require("researchDAO");
// importing to test if constructor values are applied correctly in deployed contract
const deploymentParams = require('../deployment-params.js')


// CONTRACT
contract("researchDAO", function(accounts) {

  const BN = web3.utils.BN      // BigNumbers library

  // Setting up test variables for accounts and proposal bodies
  const summonerAddress = accounts[0];
  const secondMember = accounts[1];
  const thirdMember = accounts[2];
  const fourthMember = accounts[3];

  deposit = web3.utils.toWei("10","ether")

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
  // Custom function to delay execution to wait for globalVotingPeriod to pass
  function wait(delay) {
    var start = new Date().getTime();
    while (new Date().getTime() < start + delay);
  }

  var proposalIndex = 1
  let proposalConfirmation = true

  var rdao
  let deployAddress = deploymentParams.TRUFFLE_CONTRACT_ADDRESS

  beforeEach("deployment for test", async function() {
    // If deploymentParams.TRUFFLE_CONTRACT_ADDRESS is empty deploy new contract instance
      if (deployAddress == "") {
        rdao = await researchDAO.deployed()
      } else {
        let deployAddress = deploymentParams.TRUFFLE_CONTRACT_ADDRESS
        rdao = await researchDAO.at(deployAddress)
      }
  });

  it("rdao should be deployed at address: ", async () => {
    assert.isTrue(rdao.address == (deployAddress == "" ? researchDAO.address : deployAddress));
    //console.log("1st test: ", rdao.address, (deploymentParams.DEPLOYMENT_OVERWRITE ? researchDAO.address : deployAddress))
  });

  it("contract global variables should match constructor values", async () => {
    let globalVotingPeriod = await rdao.globalVotingPeriod.call();
    let globalRagequitPeriod = await rdao.globalRagequitPeriod();
    let globalProposalDeposit = await rdao.globalProposalDeposit();
    let globalProcessingReward = await rdao.globalProcessingReward();
    let initialShares = await rdao.rDAO_totalShareSupply();
    let globalQuorum = await rdao.globalQuorum();
    let globalMajority = await rdao.globalMajority();
    let globalDilutionBound = await rdao.globalDilutionBound();
    let summonerAddress = await rdao.globalSummonerAddress();

    assert.equal(
      globalVotingPeriod,
      deploymentParams.VOTING_PERIOD,
      "rDAO::constructor values are not forwarded correctly for deployment - voting period"
      );
    assert.equal(
      globalRagequitPeriod,
      deploymentParams.RAGEQUIT_PERIOD,
      "rDAO::constructor values are not forwarded correctly for deployment - ragequit period"
      );
    assert.equal(
      globalProposalDeposit,
      deploymentParams.PROPOSAL_DEPOSIT * 1e18,
      "rDAO::constructor values are not forwarded correctly for deployment - proposal deposit"
      );
    assert.equal(
      globalProcessingReward,
      deploymentParams.PROCESSING_REWARD * 1e18,
      "rDAO::constructor values are not forwarded correctly for deployment - processing reward"
      );
    assert.equal(
      initialShares,
      deploymentParams.INITIAL_SUMMONER_SHARES,
      "rDAO::constructor values are not forwarded correctly for deployment - initially summoned shares"
      );
    assert.equal(
      globalQuorum,
      deploymentParams.QUORUM,
      "rDAO::constructor values are not forwarded correctly for deployment - quorum"
      );
    assert.equal(
      globalMajority,
      deploymentParams.MAJORITY,
      "rDAO::constructor values are not forwarded correctly for deployment - majority"
      );
    assert.equal(
      globalDilutionBound,
      deploymentParams.DILUTION_BOUND,
      "rDAO::constructor values are not forwarded correctly for deployment - dilution bound"
      );

    assert.equal(
      summonerAddress,
      accounts[0],
      "rDAO::constructor values are not forwarded correctly for deployment - summoner address"
      );
  });

  it("submit proposal for new membership", async () => {
    let submission = await rdao.submitProposal(
      proposalForNewMember.isProposalOrApplication,
      proposalForNewMember.applicant,
      proposalForNewMember.title,
      proposalForNewMember.documentationAddress,
      proposalForNewMember.fundingGoal,
      proposalForNewMember.sharesRequested,
      {value:deposit}
    )
    proposalIndex = submission.logs[0].args[0] // Storing proposalIndex by emitted event argument
    assert.equal(
      submission.logs[0].args[2],
      proposalForNewMember.title,
      "rDAO::submitProposal - title does not match");

  });

  it("confirm application", async () => {

    resConfirm = await rdao.confirmApplication(proposalIndex,proposalConfirmation,{from:secondMember,value: deposit})
    confirmedState = await rdao.proposalQueue(proposalIndex-1)

    assert.equal(
      confirmedState.isProposalOpen,
      proposalConfirmation,
      "rDAO::confirmProposal isProposalOpen is not true, the proposal has not been opened "
      );
  });

  it("vote on application proposal", async () => {
    let vote = await rdao.submitVote(proposalIndex, 1)
    let votingPower = await rdao.members(summonerAddress)
    let votes = await rdao.proposalQueue(proposalIndex-1)

    assert.equal(
      votes.yesVote.toString(),
      votingPower.shares.toString(),
      "rDAO::submitVote - Submitted votes do not add up"
    )
  });

  it("process application proposal", async () => {
    // Pause for globalVotingPeriod to allow proposal to be processed
    let waitTime = deploymentParams.VOTING_PERIOD * 1000 + 5000
    console.log("Waiting for globalVotingPeriod to pass: ", waitTime / 1000, " seconds")
    wait(waitTime)

    await rdao.processProposal(proposalIndex)
    let votingPower = await rdao.members(summonerAddress)

    let proposalState = await rdao.proposalQueue(proposalIndex-1)
    assert.isTrue(!proposalState.isProposalOpen, "rDAO::processProposal - Proposal is still open")
    assert.isTrue(proposalState.didPass, "rDAO::processProposal - Proposal did not pass, while it should have")
    assert.equal(proposalState.yesVote.toString(), votingPower.shares.toString(), "rDAO::processProposal - Yes votes do not add up")

  });

  it("submit proposal for research", async () => {
    let submission = await rdao.submitProposal(
      proposalForResearch.isProposalOrApplication,
      proposalForResearch.applicant,
      proposalForResearch.title,
      proposalForResearch.documentationAddress,
      proposalForResearch.fundingGoal,
      proposalForResearch.sharesRequested,
      {value:deposit}
    )

    proposalIndex  = submission.logs[0].args[0] // Storing proposal index emitted by event
    assert.equal(
      submission.logs[0].args[2],
      proposalForResearch.title,
      "rDAO::submitProposal - title does not match"
    )

  });


  it("vote on research proposal", async () => {
    let vote = await rdao.submitVote(proposalIndex, 2)
    let votingPower = await rdao.members(summonerAddress)
    let votes = await rdao.proposalQueue(proposalIndex-1)

    assert.equal(
      votes.noVote.toString(),
      votingPower.shares.toString(),
      "rDAO::submitVote - casted votes don't add up"
    )

  });

  it("process research proposal", async () => {
    let waitTime = deploymentParams.VOTING_PERIOD * 1000 + 5000
    console.log("Waiting for globalVotingPeriod to pass: ", waitTime / 1000, " seconds")
    wait(waitTime)

    await rdao.processProposal(proposalIndex)

    let votingPower = await rdao.members(summonerAddress)

    let proposalState = await rdao.proposalQueue(proposalIndex-1)
    assert.isTrue(!proposalState.isProposalOpen, "rDAO::processProposal - Proposal is still open")
    assert.isTrue(!proposalState.didPass, "rDAO::processProposal - Proposal did pass, while it shouldnt have")
    assert.equal(proposalState.noVote.toString(), votingPower.shares.toString(), "rDAO::processProposal - No votes do not add up")

  });

  // More test ideas:
  //    -testing quorum and majority
  //    -

});