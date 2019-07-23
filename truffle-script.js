require('truffle-test-utils').init();
const contract = require('truffle-contract')
const researchDAO = contract(artifacts);

module.exports = (callback)=> {
    var accounts =  web3.eth.getAccounts()
    deposit = web3.utils.toWei("10", "ether")
    rdao = await researchDAO.deployed()
    resPropose =  await rdao.submitProposal(true,"0x7Fb1129C03A28e28Ffb7D3FaF31B9dCf31Cc2E7d","Valami","0x0",100,100,{value:deposit})
    resVote = await rdao.submitVote(1,1)
  }

  res = this.researchDAO.deployed().then(instance => {return instance.confirmApplication(1,true,{from: accounts[1],value: deposit});})


deposit = web3.utils.toWei("10","ether")
accounts = await web3.eth.getAccounts()
rdao = await researchDAO.deployed()
resPropose = await rdao.submitProposal(false,"0xb9805F878Ef22A91134A6d52f4B05C51F1fE344f","First application","0x0",10,10,{value:deposit})
resConfirm = this.researchDAO.deployed().then(instance => {return instance.confirmApplication(1,true,{from: accounts[1],value: deposit});})
resVote = await rdao.submitVote(1,1)
resProcess = await rdao.processProposal(1)

resMembers = await rdao.members(accounts[1])

confirmedState = await rdao.proposalQueue[proposalIndex-1].isProposalOpen
