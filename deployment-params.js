// Contract deployment parameters for contstructor

// If you want to interact with the same contract and watch in ganache set its address here and set , after you did 'truffle migrate --reset'
// If you want to deploy a new contract for each test this to empty ("")
module.exports.TRUFFLE_CONTRACT_ADDRESS = "" // DEFAULT VALUE: empty

module.exports.VOTING_PERIOD = 60 //259200 = 1 month
module.exports.RAGEQUIT_PERIOD = 60 //2592000 = 1 month
module.exports.PROPOSAL_DEPOSIT = 1
module.exports.PROCESSING_REWARD = 10           // divided by 10**2 when deploying
module.exports.INITIAL_SUMMONER_SHARES = 10
module.exports.QUORUM = 50
module.exports.MAJORITY = 50
module.exports.DILUTION_BOUND = 2
