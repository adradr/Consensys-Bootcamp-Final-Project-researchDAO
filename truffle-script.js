require('truffle-test-utils').init();
const contract = require('truffle-contract')
const researchDAO = contract(artifacts);

module.exports = (callback)=> {
    var accounts =  web3.eth.getAccounts()
    var deposit = web3.utils.toWei("10", "ether")
    var rdao = await researchDAO.deployed()
    var resPropose =  await rdao.submitProposal(true,"0x7Fb1129C03A28e28Ffb7D3FaF31B9dCf31Cc2E7d","Valami","0x0",100,100,{value:deposit})
    var resVote = await rdao.submitVote(1,1)
  }