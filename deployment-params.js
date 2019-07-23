// Contract deployment parameters for contstructor

// If you want to interact with the same contract and watch in ganache set its address here and set , after you did 'truffle migrate --reset'
// If you want to deploy a new contract for each unit test set this to empty ("")
module.exports.TRUFFLE_CONTRACT_ADDRESS = "0x3aFE97C775Aa571699aC31A56d1231BE3ff868BF"

module.exports.VOTING_PERIOD = 30 //2592000    // 1 month
module.exports.RAGEQUIT_PERIOD = 30 //2592000  // 1 month
module.exports.PROPOSAL_DEPOSIT = 10
module.exports.PROCESSING_REWARD = 10           // divided by 10**2 when deploying
module.exports.INITIAL_SUMMONER_SHARES = 10
module.exports.QUORUM = 50
module.exports.MAJORITY = 50
module.exports.DILUTION_BOUND = 3
