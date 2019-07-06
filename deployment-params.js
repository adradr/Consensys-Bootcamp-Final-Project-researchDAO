// Contract deployment parameters for contstructor

//module.exports.TOKEN = ''
module.exports.VOTING_PERIOD = 2592000
module.exports.RAGEQUIT_PERIOD = 2592000
module.exports.PROPOSAL_DEPOSIT = 10
module.exports.PROCESSING_REWARD = 10           // divider - 10 means: 1/10 ETH per processing
module.exports.INITIAL_SUMMONER_SHARES = 10
module.exports.TOKENS_PER_ETH_DEPOSITED = 100

// Contract constructor waits for an msg.value
//module.exports.INITIAL_ETH_DEPOSITED_BY_SUMMONER = 1