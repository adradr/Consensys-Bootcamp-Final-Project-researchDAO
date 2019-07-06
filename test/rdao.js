var rDAO = artifacts.require("researchDAO");

// importing to test if constructor values are applied correctly in deployed contract
const deploymentParams = require('../deployment-params.js')


contract("rDAO", function(accounts) {

  // Setting up test variables

  const summonerAddress = accounts[0];
  const secondMember = accounts[1];
  const thirdMember = accounts[2];
  const fourthMember = accounts[3];

const proposalForNewMember = {
  applicant: secondMember,
  sharesRequested: 10,                              // as much the initial summoner received
  title: "First member application for testing",
  documentationAddress: 0x0                         // Empty document
}

const proposalForResearch = {
  title: "First research proposal for testing",
  documentationAddress: 0x0,  // Empty document
  fundingGoal: 10
}


  // Is it deployed properly
  it("rdao should be deployed at address: " + rDAO.address, function(done) {
    var rdao = rDAO.deployed();
    //console.log("researchDAO instance rDAO address: ", rDAO.address);
    assert.isTrue(rdao.address != 0x0);
    done();
  });





});
