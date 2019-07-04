// researchDAO - Collective intelligence for the research community
// Ethereum Developer Bootcamp Final Project
// by Adrian Lenard at 03/07/2019
// Purpose of this contract is to enable guild like operation for
// researchers while letting crowdfunding accelerate research funding

pragma solidity ^0.5.0;

// Importing SafeMath library for safe operations and ERC20 for token interactions
import "github.com/OpenZeppelin/openzeppelin-solidity/contracts/math/SafeMath.sol";
import "github.com/OpenZeppelin/openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";

contract researchDAO {

using SafeMath for uint; // Enabling contract to use SafeMath library for uint type operations

// Global constants for constructor

uint256 globalVotingPeriod;           // Default value is 30 days or 2.592e+6 seconds
uint256 globalRagequitPeriod;         // Default value is 7 days or 604800 seconds
uint256 globalProposalDeposit;        // Default value is 10 ETH
uint256 globalProcessingReward;       // Default value is 0.1 ETH to incentivize processing; paid from funds.
uint256 globalSummoningTime;          // The block.timestamp at contract deployment
uint256 globalSharesPerDepositedETH;  // The amount of shares minted per 1 ETH deposited

ERC20 public guildERC20Token;         // Reference for the token used for the DAO

// Security limits thanks to Moloch DAO
// These numbers are quite arbitrary; they are small enough to avoid overflows when doing calculations
// with periods or shares, yet big enough to not limit reasonable use cases.

uint256 constant MAX_VOTING_PERIOD_LENGTH = 10**18;     // maximum length of voting period
uint256 constant MAX_GRACE_PERIOD_LENGTH = 10**18;      // maximum length of grace period
uint256 constant MAX_NUMBER_OF_SHARES = 10**18;         // maximum number of shares that can be minted
uint256 constant MAX_NUMBER_OF_TOKENS = 10**18;         // maximum number of tokens that can be minted
uint256 constant MAX_TOKEN_MULTIPLIER = 10**18;         // maximum number for token multiplier that can be used
uint256 constant MAX_PROCESS_REWARD = 10**18;           // maximum number for processing reward that can be used
uint256 constant MAX_INITIAL_SHARE = 10**18;            // maximum number for initial share request that can be used
uint256 constant MAX_TOKENS_PER_DEPOSIT = 10**18;       // maximum number for token per deposit multiper that can be used

// Events

event Summoned(address indexed summoner, uint256 initialShares );

event SubmitProposal();
event SubmitVote();
event ProcessProposal();
event AbortProposal();

event ExternalFundGuild();
event ExternalFundProposal();

event RageQuit();


// Guild governance - These variables are responsible for governance related values

// Members
struct Member {
    uint256 shares;   // rDAO voting shares - voting power
    uint256 tokens;   // rDAO tokens - monetary power

}
mapping (address => Member) public members;  // Storing member details in a mapping

// Votes
enum Vote {
    Null,   // default value
    Yes,
    No
}
// Proposal structure
struct Proposal {     // This struct serves as the framework for a proposal to be submitted

    bytes32 proposalHash;
    address owner;

    string  title;
    string  description;
    bytes32 documentationAddress;

    uint256 fundingGoal;
    uint256 percentForSale;

    bool    isProposalOpen;
    uint256 creationTimestamp;

    mapping (address => Vote) votesByMembers;

    }

mapping ( bytes => Proposal ) public proposals;             // Storing proposals in a mapping based on proposalHash as an index
Proposal[] public proposalQueue;                            // Storing proposals in an array for queuing
mapping ( address => bytes[] ) public proposalsOfMembers;   // Storing proposals for each member in an array

// Guild bank - These variables handle internal token and share allocations

// Member shares and tokens are stored in the Member struct used in members mapping
uint256 rDAO_totalTokenSupply;                // Counting the total supply minted
uint256 rDAO_totalShareSupply;                // Counting the total shares issued

// Modifiers

// memberOnly serves as the restriction modifier for function calls
modifier memberOnly {
    require(members[msg.sender].shares > 0, "rDAO::memberOnly - not a member");
    _;
}

// Summoning constructor

  constructor(
  address _guildERC20Token,       // Will be implemented later
  uint256 _globalVotingPeriod,
  uint256 _globalRagequitPeriod,
  uint256 _globalProposalDeposit,
  uint256 _globalProcessingReward,
  uint256 _initialSharesRequested,
  uint256 _globalTokensPerDepositedETH)
  public {
    // Checking summoning global constant values for security limits
    require(_globalVotingPeriod > 0,                                "rDAO::constructor - Voting period cannot be zero");
    require(_globalVotingPeriod <= MAX_VOTING_PERIOD_LENGTH,        "rDAO::constructor - Voting period is out of boundaries");

    require(_globalRagequitPeriod > 0,                              "rDAO::constructor - Ragequit period cannot be zero");
    require(_globalRagequitPeriod <= MAX_VOTING_PERIOD_LENGTH,      "rDAO::constructor - Ragequit period is out of boundaries");

    require(_globalTokensPerDepositedETH > 0,                       "rDAO::constructor - Tokens issued per ETH multiplier cannot be negative or zero");
    require(_globalTokensPerDepositedETH <= MAX_TOKEN_MULTIPLIER,   "rDAO::constructor - Tokens issued per ETH multiplier is out of boundaries");

    require(_globalProcessingReward > 0,                            "rDAO::constructor - Processing reward can't be zero. It serves as incentive");
    require(_globalProcessingReward <= MAX_PROCESS_REWARD,          "rDAO::constructor - Processing reward is out of boundaries");

    require(_initialSharesRequested > 0,                            "rDAO::constructor - Initially requested share can't be zero.");
    require(_initialSharesRequested <= MAX_INITIAL_SHARE,           "rDAO::constructor - Initially requested share is out of boundaries");

    require(_globalTokensPerDepositedETH > 0,                       "rDAO::constructor - Initially requested share can't be zero.");
    require(_globalTokensPerDepositedETH <= MAX_TOKENS_PER_DEPOSIT, "rDAO::constructor - Initially requested share is out of boundaries");

    // Setting global constansts based on constructor parameters
    globalVotingPeriod =          _globalVotingPeriod;
    globalRagequitPeriod =        _globalRagequitPeriod;
    globalProposalDeposit =       _globalProposalDeposit;
    globalProcessingReward =      _globalProcessingReward;
    globalTokensPerDepositedETH = _globalTokensPerDepositedETH;

    // Checking share guild funding amount received to match initial tokens requested
    require(msg.value > 0), "rDAO::constructor - Summoner cannot participate without skin in the game");

    // Setting up initial founding member and storing his shares and tokens in members mapping
    members[msg.sender].shares = _initialSharesRequested;
    members[msg.sender].tokens = globalTokensPerDepositedETH * msg.value;

    // Storing the timestamp of the summoning (now is alias for block.timestamp)
    globalSummoningTime = now;

    // Emitting the corresponding event with the summoners address and the allocated share number
    emit Summoned(msg.sender, members[msg.sender].shares);

  }

// Functions

// To-Do

// submitProposal()           when a member proposes something either for research of new membership
// submitVote()               when a member casts a vote on a given proposal from within the DAO
// processProposal()          when a member finalizes a proposal by closing it and executing it based on the results
// rageQuit()                 when a member ragequits and collects his funds based on rDAO token amount
// externalFundProposal()     when an external contributor funds a specific proposal
// externalFundDAO()          when an external contributor funds the DAO generally to let internal members decide over the fund


// Getter functions

/**
* @dev allow contract to receive funds
*/
function() public payable {}

}