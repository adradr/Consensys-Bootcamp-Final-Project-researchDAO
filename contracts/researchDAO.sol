// researchDAO - Collective intelligence for the research community
// Ethereum Developer Bootcamp Final Project
// by Adrian Lenard at 03/07/2019
// Purpose of this contract is to enable guild like operation for
// researchers while letting crowdfunding accelerate research funding

pragma solidity ^0.5.0;

// Importing SafeMath library for safe operations and ERC20 for token interactions
import './OpenZeppelin//SafeMath.sol';
import './OpenZeppelin//ERC20.sol';

contract researchDAO {

using SafeMath for uint; // Enabling contract to use SafeMath library for uint type operations

// Global constants for constructor

uint256 public globalVotingPeriod;           // Default value is 30 days or 2.592e+6 seconds
uint256 public globalRagequitPeriod;         // Default value is 7 days or 604800 seconds
uint256 public globalProposalDeposit;        // Default value is 10 ETH
uint256 public globalProcessingReward;       // Default value is 0.1 ETH to incentivize processing; paid from funds - Usage - 10 means: 1/10 ETH per processing
uint256 public globalSummoningTime;          // The block.timestamp at contract deployment
uint256 public globalTokensPerDepositedETH;  // The amount of tokens minted per 1 ETH deposited

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
uint256 constant MAX_FUNDING_GOAL = 10**18;             // maximum number for funding that can be used

// Events

event Summoned(address indexed summoner, uint256 initialShares );

event SubmittedProposal(uint256 proposalIndex, address indexed proposer, string title, bytes32 documentationAddress, bool isProposalOrApplication);
event SubmittedVote();
event ProcessedProposal();
event AbortedProposal();

event ExternalFundGuild();
event ExternalFundProposal();

event RageQuit();


// Guild governance - These variables are responsible for governance related values

// Members
struct Member {
    uint256 shares;   // rDAO voting shares - voting power
    uint256 tokens;   // rDAO tokens - monetary power

}
mapping (address => Member) public members;   // Storing member details in a mapping
address[] public memberArray;                 // Member array

// Votes
enum Vote {
    Null,   // default value
    Yes,
    No
}
// Proposal structure
struct Proposal {     // This struct serves as the framework for a proposal to be submitted

    uint256 proposalIndex;  // the numeric ID of the proposal
    address proposer;   // the address of the submitter
    address applicant;  // the applicant address who would like to join
    uint256 sharesRequested;  // shares requested for the proposed member
    string  title;  // simple title for the proposal, e.g.: Adrian L. new membership proposal
    bytes32 documentationAddress;   // IPFS hash of the detailed documentation, e.g.: research project description
    uint256 fundingGoal;  // amount of the required funding, this is allocated from guild funds upon voting or collected from external contributors
    //uint256 percentForSale;   // percentage of the fundable share - to be implemented lated
    bool    isProposalOpen;   // state of the proposal, default is open, closed in processProposal() call
    uint256 creationTimestamp;  // block.timestamp when proposal is submitted
    mapping (address => Vote) votesByMembers;   // stores each members vote in a mapping
    uint256 yesVote;  // # of Yes votes
    uint256 noVote;   // # of No votes
    bool    didPass;  // result state of proposal, changed when calling processProposal()
    uint256 externalFundsCollected;  // the amount received from external contributors
    bool    isProposalOrApplication;   // This is used for switching between member application and proposal for research.
                                       // [0 = proposal for research, 1 = new member application]
    }

//mapping ( uint256 => Proposal ) public proposalsByIndex;    // Storing proposals in a mapping based on proposalIndex as an index
uint256 public proposalCounter;                             // Storing actual highest index for proposals - incremented upon submitProposal()
Proposal[] public proposalQueue;                            // Storing proposals in an array for queuing
mapping ( address => uint256 ) public proposalsOfMembers;   // Storing proposals for each member in an array

// Guild bank - These variables handle internal token and share allocations

// Member shares and tokens are stored in the Member struct used in members mapping
uint256 public rDAO_totalTokenSupply;                // Counting the total supply minted
uint256 public rDAO_totalShareSupply;                // Counting the total shares issued

// Modifiers

// memberOnly serves as the restriction modifier for function calls
modifier memberOnly {
    require(members[msg.sender].shares > 0, "rDAO::memberOnly - not a member of researchDAO");
    _;
}


// Summoning constructor

  constructor(
  //address _guildERC20Token,       // Will be implemented later
  uint256 _globalVotingPeriod,
  uint256 _globalRagequitPeriod,
  uint256 _globalProposalDeposit,
  uint256 _globalProcessingReward,
  uint256 _initialSharesRequested,
  uint256 _globalTokensPerDepositedETH)
  public
  {
    // Checking summoning global constant values for security limits
    require(_globalVotingPeriod > 0,                                "rDAO::constructor - Voting period cannot be zero");
    require(_globalVotingPeriod <= MAX_VOTING_PERIOD_LENGTH,        "rDAO::constructor - Voting period is out of boundaries");

    require(_globalRagequitPeriod > 0,                              "rDAO::constructor - Ragequit period cannot be zero");
    require(_globalRagequitPeriod <= MAX_VOTING_PERIOD_LENGTH,      "rDAO::constructor - Ragequit period is out of boundaries");

    require(_globalProposalDeposit > 0,                             "rDAO::constructor - Proposal deposit cannot be negative or zero");
    require(_globalProposalDeposit <= MAX_TOKEN_MULTIPLIER,         "rDAO::constructor - Proposal deposit is out of boundaries");

    require(_globalProcessingReward > 0,                            "rDAO::constructor - Processing reward can't be zero. It serves as incentive");
    require(_globalProcessingReward <= MAX_PROCESS_REWARD,          "rDAO::constructor - Processing reward is out of boundaries");

    require(_initialSharesRequested > 0,                            "rDAO::constructor - Initially requested share can't be zero.");
    require(_initialSharesRequested <= MAX_INITIAL_SHARE,           "rDAO::constructor - Initially requested share is out of boundaries");

    require(_globalTokensPerDepositedETH > 0,                       "rDAO::constructor - Tokens per ETH deposited can't be zero.");
    require(_globalTokensPerDepositedETH <= MAX_TOKENS_PER_DEPOSIT, "rDAO::constructor - Tokens per ETH deposited is out of boundaries");

    // Setting global constansts based on constructor parameters
    globalVotingPeriod = _globalVotingPeriod;
    globalRagequitPeriod = _globalRagequitPeriod;
    globalProposalDeposit = _globalProposalDeposit;
    globalProcessingReward = 10; // _globalProcessingReward.div(100);
    globalTokensPerDepositedETH = _globalTokensPerDepositedETH;

    // Storing summoner as a member
    memberArray.push(msg.sender);

    // Setting up initial founding member and storing his shares in members mapping
    members[msg.sender].shares = _initialSharesRequested;

    // Initializing share supply according to summon parameters
    rDAO_totalShareSupply = members[msg.sender].shares;

    // Storing the timestamp of the summoning (now is alias for block.timestamp)
    globalSummoningTime = now;

    // Counter initialization
    proposalCounter = 0;

    // Emitting the corresponding event with the summoners address and the allocated share number
    emit Summoned(msg.sender, members[msg.sender].shares);

  }

// Functions
// ---------
// submitProposal()           when a member proposes something either for research or new membership application
// submitVote()               when a member casts a vote on a given proposal from within the DAO
// processProposal()          when a member finalizes a proposal by closing it and executing it based on the results
// depositFunds()             when a member wants to deposit ETH in return of guild tokens
// withdrawFunds()            when a member wants to withdraw his tokens in exchange for ETH
// rageQuit()                 when a member ragequits and collects his funds based on rDAO token amount
// externalFundProposal()     when an external contributor funds a specific proposal
// externalFundDAO()          when an external contributor funds the DAO generally to let internal members decide over the fund

function submitProposal(
bool _isProposalOrApplication,
address _applicant,
string memory _title,
bytes32 _documentationAddress,
uint256 _fundingGoal,
//uint256 _percentForSale,
uint256 _sharesRequested)
public
memberOnly
{

  // Checking inputs for all types of proposal
  require(_documentationAddress.length > 0,             "rDAO::submitProposal - Attached documentation is missing");

  // IF proposal for research
  if ( _isProposalOrApplication == true ) {
    require(_fundingGoal > 0,                           "rDAO::submitProposal - Funding goal cannot be zero");
    require(_fundingGoal <= MAX_FUNDING_GOAL,           "rDAO::submitProposal - Funding goal is out of boundaries");
    _sharesRequested = 0;                               // Not needed when proposing a research
  }

  // IF proposal for new member application
  if( _isProposalOrApplication == false ) {
    require(_sharesRequested > 0,                       "rDAO::submitProposal - Shares requested cannot be zero");
    require(_sharesRequested <= MAX_NUMBER_OF_SHARES,   "rDAO::submitProposal - Shares requested is out of boundaries");
    _fundingGoal = 0;                                   // Not needed when proposing a new member

  }

  // Copying current # for proposals and incrementing counter
  uint256 _proposalIndex = proposalCounter.add(1);
  proposalCounter = proposalCounter.add(1);

  // Creating proposal with fn parameters
  Proposal memory proposal = Proposal({
    proposalIndex: _proposalIndex,
    proposer: msg.sender,
    applicant: _applicant,
    sharesRequested: _sharesRequested,
    title: _title,
    documentationAddress: _documentationAddress,
    fundingGoal: _fundingGoal,
    //percentForSale: _percentForSale,
    isProposalOpen: true,
    creationTimestamp: now,
    yesVote: 0,
    noVote: 0,
    didPass: false,
    externalFundsCollected: 0,
    isProposalOrApplication: _isProposalOrApplication
  });

  // Adding the created proposal to the proposal queue
  proposalQueue.push(proposal);

  // Adding proposal to proposalsOfMembers mapping
  proposalsOfMembers[msg.sender] = _proposalIndex;

  // Emitting related event
  emit SubmittedProposal(proposal.proposalIndex, msg.sender, proposal.title, proposal.documentationAddress, proposal.isProposalOrApplication);

}

function submitVote(
  uint256 _proposalIndex,
  uint8 _utin8vote
)
public
memberOnly
{
// require proposalIndex to a valid proposal using proposalCount
// check timeframe: require VOTING_PERIOD - proposal.creationTimestamp > 0
// convert vote from uint to Vote struct to use with votesByMembers
// store member and his vote in votesByMembers
//mapping (address => Vote) votesByMembers;   // stores each members vote in a mapping
// store YesVote or NoVote and add up voter shares
// emit Event submittedVote()



}

// Getter functions

/**
* @dev allow contract to receive funds
*/
function() external payable {}

}