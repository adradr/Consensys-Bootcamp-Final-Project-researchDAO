/// @author Adrian Lenard
/// @title researchDAO - Collective intelligence for the research community
/// @notice Purpose of this contract is to enable guild like operation for researchers, while enabling crowdfunding capital to accelerate research funding
/// @dev All function calls are currently implemented without side effects

pragma solidity ^0.5.0;

// Importing SafeMath library for safe operations and ERC20 for token interactions
import './OpenZeppelin//SafeMath.sol';
import './OpenZeppelin//ERC20.sol';

// Imports for Remix IDE
//import 'https://github.com/OpenZeppelin/openzeppelin-solidity/blob/master/contracts/math/SafeMath.sol';
//import 'https://github.com/OpenZeppelin/openzeppelin-solidity/blob/master/contracts/token/ERC20/ERC20.sol';

contract researchDAO {

using SafeMath for uint;                     // Enabling contract to use SafeMath library for uint type operations
ERC20 public guildERC20Token;                // Reference for the token used for the DAO

// Global constants for constructor

uint256 public globalVotingPeriod;            // Default value is 30 days or 2.592e+6 seconds
uint256 public globalRagequitPeriod;          // Default value is 7 days or 604800 seconds
uint256 public globalProposalDeposit;         // Default value is 10 ETH
uint256 public globalProcessingReward;        // Default value is 0.1 ETH to incentivize processing. 10 means: 1/10 ETH per
uint256 public globalSummoningTime;           // The block.timestamp at contract deployment
uint256 public globalTokensPerDeposit;        // Default value is 10, this sets the amount of tokens minted per 1 ETH deposited
uint8 public globalQuorum;                    // Default value is 50 for 50%, this sets the required participation for a proposal vote to pass
uint8 public globalMajority;                  // Default value is 50 for 50%, this sets the number of required Yes votes for a vote to pass
uint8 public globalDilutionBound;             // Default value is 2 for 2x dilution, this prevents extreme dilution of members

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
uint8 constant MAX_QUORUM = 10**2;                      // maximum number for quorum that can be used
uint8 constant MAX_MAJORITY = 10**2;                    // maximum number for majority that can be used
uint8 constant MAX_DILUTION_BOUND = 10**2;              // maximum number for dilution bound that can be used

// Events

event Summoned(address indexed summoner, uint256 initialShares );

event SubmittedProposal(
  uint256 proposalIndex,
  address indexed proposer,
  string title,
  bytes32 documentationAddress,
  bool isProposalOrApplication);
event SubmittedVote(uint256 proposalIndex, address voter, uint8 vote);
event ProcessedProposal(uint256 proposalIndex, bool didPass);
event MemberJoinedGuild(address applicant, uint256 sharesMinted);
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
mapping(address => Member) public members;   // Storing member details in a mapping
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
    address payable proposer;   // the address of the submitter
    address applicant;  // the applicant address who would like to join
    uint256 sharesRequested;  // shares requested for the proposed member
    string  title;  // simple title for the proposal, e.g.: Adrian L. new membership proposal
    bytes32 documentationAddress;   // IPFS hash of the detailed documentation, e.g.: research project description
    uint256 fundingGoal;  // amount of the required funding, coming from guild fund and external contributors
    bool isProposalOpen;   // state of the proposal, default is open, closed in processProposal() call
    uint256 creationTimestamp;  // block.timestamp when proposal is submitted
    mapping(address => Vote) votesByMembers;   // stores each members vote in a mapping
    uint256 yesVote;  // # of Yes votes
    uint256 noVote;   // # of No votes
    bool    didPass;  // result state of proposal, changed when calling processProposal()
    uint256 externalFundsCollected;  // the amount received from external contributors
    bool isProposalOrApplication;   // This is used for switching between member application and proposal for research.
                                       // [0 = proposal for research, 1 = new member application]
    //uint256 percentForSale;   // percentage of the fundable share - to be implemented lated
    }


uint256 public proposalCounter;     // Storing actual highest index for proposals - incremented upon submitProposal()
Proposal[] public proposalQueue;    // Storing proposals in an array for queuing
mapping(address => uint256[]) public proposalsOfMembers;      // Storing proposals for each member in an array
// Storing the number of total shares at the moment of last Yes vote casted on a particular proposal - used for dilution bound
mapping(uint256 => uint256) public maxTotalSharesAtYesVote;
// Guild bank - These variables handle internal token and share allocations

// Member shares and tokens are stored in the Member struct used in members mapping
uint256 public rDAO_totalTokenSupply;                // Counting the total supply minted
uint256 public rDAO_totalShareSupply;                // Counting the total shares issued
uint256 public totalSharesRequested;                 // Counting the total shares requested in the currently open proposals

// Modifiers

// memberOnly serves as the restriction modifier for function calls
modifier memberOnly {
    require(members[msg.sender].shares > 0, "rDAO::memberOnly - not a member of researchDAO");
    _;
}


// Summoning constructor
/// @notice Constructor function for summoning the DAO
/// @param _globalVotingPeriod The number which sets the voting period in seconds
/// @param _globalRagequitPeriod The number which sets the ragequit period in seconds
/// @param _globalProposalDeposit The number that sets the required deposit upon proposal submission
/// @param _globalProcessingReward The number that sets the reward value when a member processes an ended proposal
/// @param _initialSharesRequested The number of the shares the summoner receives when summoning the DAO
/// @param _globalTokensPerDeposit The number of tokens minted when a member deposits Eth to the guild bank
/// @param _globalQuorum The quorum percentage required for a vote to pass
/// @param _globalMajority The majority percentage that is requirement for Yes votes to pass
/// @param _globalDilutionBound The number that prohibits extreme dilution of remaining members after a massive coordinated ragequit

  constructor(
  //address _guildERC20Token,       // Will be implemented later
  uint256 _globalVotingPeriod,
  uint256 _globalRagequitPeriod,
  uint256 _globalProposalDeposit,
  uint256 _globalProcessingReward,
  uint256 _initialSharesRequested,
  uint256 _globalTokensPerDeposit,
  uint8 _globalQuorum,
  uint8 _globalMajority,
  uint8 _globalDilutionBound)
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
    require(_globalTokensPerDeposit > 0,                            "rDAO::constructor - Tokens per ETH deposited can't be zero.");
    require(_globalTokensPerDeposit <= MAX_TOKENS_PER_DEPOSIT,      "rDAO::constructor - Tokens per ETH deposited is out of boundaries");
    require(_globalQuorum > 0,                                      "rDAO::constructor - Quorum can't be zero.");
    require(_globalQuorum <= MAX_QUORUM,                            "rDAO::constructor - Quorum is out of boundaries");
    require(_globalMajority > 0,                                    "rDAO::constructor - Majority can't be zero.");
    require(_globalMajority <= MAX_MAJORITY,                        "rDAO::constructor - Majority is out of boundaries");
    require(_globalDilutionBound > 0,                               "rDAO::constructor - Dilution bound can't be zero.");
    require(_globalDilutionBound <= MAX_DILUTION_BOUND,             "rDAO::constructor - Dilution bound is out of boundaries");

    // Setting global constansts based on constructor parameters
    globalVotingPeriod = _globalVotingPeriod;
    globalRagequitPeriod = _globalRagequitPeriod;
    globalProposalDeposit = _globalProposalDeposit.mul(1e18); // Converting wei to Ether
    globalProcessingReward = _globalProcessingReward;
    globalTokensPerDeposit = _globalTokensPerDeposit;
    globalQuorum = _globalQuorum;
    globalMajority = _globalMajority;
    globalDilutionBound = _globalDilutionBound;

    // Storing summoner as a member
    memberArray.push(msg.sender);

    // Setting up initial founding member and storing his shares in members mapping
    members[msg.sender].shares = _initialSharesRequested;

    // Initializing share supply according to summoning parameters
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


/// @notice submitProposal function creates a new proposal submitted by an existing member
/// @param _isProposalOrApplication Acts as a switch for deciding the proposal type: proposal for research OR proposal for new member application
/// @param _applicant The address of the applying member
/// @param _title The title of the submitted proposal
/// @param _documentationAddress Hash address for the detailed documentation of the proposal
/// @param _fundingGoal Funds required by the proposer to realize the research proposal
/// @param _sharesRequested New shares minted for the applying member

function submitProposal(
bool _isProposalOrApplication,
address _applicant,
string memory _title,
bytes32 _documentationAddress,
uint256 _fundingGoal,
//uint256 _percentForSale,
uint256 _sharesRequested)
public
payable
memberOnly
{
  // Checking if there is deposit sent with submitProposal function
  require(msg.value == globalProposalDeposit,               "rDAO::submitProposal - Proposal deposit is not equal to requirement");

  // Checking inputs for all types of proposal
  require(_documentationAddress.length > 0,                 "rDAO::submitProposal - Attached documentation is missing");

  // IF proposal for research
  if ( _isProposalOrApplication == true ) {
    require(_fundingGoal > 0,                               "rDAO::submitProposal - Funding goal cannot be zero");
    require(_fundingGoal <= MAX_FUNDING_GOAL,               "rDAO::submitProposal - Funding goal is out of boundaries");
    _sharesRequested = 0;                                   // Zeroing out. Not needed when proposing a research
  }

  // IF proposal for new member application
  if( _isProposalOrApplication == false ) {
    require(_sharesRequested > 0,                           "rDAO::submitProposal - Shares requested cannot be zero");
    // Calculating total shares requested plus total shares minted
    uint256 shareUpperBoundaries = _sharesRequested.add(rDAO_totalShareSupply).add(totalSharesRequested);
    require(shareUpperBoundaries <= MAX_NUMBER_OF_SHARES,   "rDAO::submitProposal - Shares requested is out of boundaries");
    _fundingGoal = 0;                                       // Zeroing out. Not needed when proposing a new member
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

  // Adding # of shares requested by the current proposal to totalSharesRequested if this is a member application
  if (!_isProposalOrApplication) {
    totalSharesRequested = totalSharesRequested.add(proposal.sharesRequested);
  }

  // Adding the created proposal to the proposal queue
  proposalQueue.push(proposal);

  // Adding proposal to proposalsOfMembers mapping array
  proposalsOfMembers[msg.sender].push(_proposalIndex);

  // Emitting related event
  emit SubmittedProposal(proposal.proposalIndex, msg.sender, proposal.title, proposal.documentationAddress, proposal.isProposalOrApplication);

}

/// @notice submitVote function to cast a vote on a given proposal
/// @param _proposalIndex The index/ID of the proposal to vote on
/// @param _uint8vote The vote - 0: Null, 1: Yes, 2: No

function submitVote(
  uint256 _proposalIndex,
  uint8 _uint8vote
)
public
memberOnly
{
  // require proposalIndex to a valid proposal using proposalCount
  // check timeframe: require VOTING_PERIOD - proposal.creationTimestamp > 0
  // convert vote from uint to Vote struct to use with votesByMembers
  // store member and his vote in votesByMembers
  // mapping (address => Vote) votesByMembers;   // stores each members vote in a mapping
  // store YesVote or NoVote and add up voter shares
  // emit Event submittedVote()

  Proposal storage proposal = proposalQueue[_proposalIndex.sub(1)];

  // Checking that the _proposalIndex parameter is a valid proposal
  require(_proposalIndex <= proposalCounter, "rDAO::submitVote - proposalIndex is not valid, not existing proposal");

  // Checking if the proposal voting period has ended
  bool isTimeLeft = now - globalVotingPeriod < proposal.creationTimestamp;
  require(isTimeLeft == true, "rDAO::submitVote - proposal period ended, no longer accepts votes. Time to processProposal()");

  // Checking that the input parameter _uint8vote is at most 3 and converting it into a Vote sturct
  require(_uint8vote < 3, "rDAO::submitVote - _uint8vote must be less than 3");
  Vote vote = Vote(_uint8vote);

  // Checking if the member has voted already and storing the casted vote into votesByMembers
  require(proposal.votesByMembers[msg.sender] == Vote.Null , "rDAO::submitVote - member already voted");
  proposal.votesByMembers[msg.sender] = vote;

  // Incrementing vote counters in proposal based on casted vote times the shares of the voting member
  if (vote == Vote.Yes) {
    proposal.yesVote = proposal.yesVote.add(members[msg.sender].shares);
    // Updating the number of total shares minted when member voted yes and share supply changed since last yes vote
    if (rDAO_totalShareSupply > maxTotalSharesAtYesVote[_proposalIndex]) {
      maxTotalSharesAtYesVote[_proposalIndex] = rDAO_totalShareSupply;
    }
  } else if (vote == Vote.No) {
    proposal.noVote = proposal.noVote.add(members[msg.sender].shares);
  }

  // Emitting the relevant event SubmittedVote()
  emit SubmittedVote(_proposalIndex, msg.sender, _uint8vote);

}

/// @notice processProposal processes an ended proposal and executes the proposed subject
/// @param _proposalIndex The index/ID of the proposal to process
/// @dev If proposal fails need to transfer back external contributions

function processProposal(uint256 _proposalIndex)
public
memberOnly
{
  // check if proposal exists
  // check if proposal has ended
  // [check if quorum reached ?] 50% minimum
  // count votes and modify didPass
  // close proposal - isProposalOpen
  // based on isProposalOrApplication
  //      - proposal:    distribute funds or send back contributions
  //      - application: distribute shares
  // return proposer ETH deposit

  // Storing proposal data in var
  Proposal storage proposal = proposalQueue[_proposalIndex.sub(1)];

  // Checking that the _proposalIndex parameter is a valid proposal
  require(_proposalIndex <= proposalCounter, "rDAO::processProposal - proposalIndex is not valid, not existing proposal");

  // Checking if the proposal is still open
  bool isTimeLeft = now - globalVotingPeriod > proposal.creationTimestamp;
  require(isTimeLeft == false, "rDAO::processProposal - proposal is still open for voting");

  // Setting vote results based on summary of casted votes
  proposal.didPass = proposal.yesVote > proposal.noVote;

  // Setting proposal fail if dilution bound would be exceeded
  if (rDAO_totalShareSupply.mul(globalDilutionBound) < maxTotalSharesAtYesVote[_proposalIndex]) {
    proposal.didPass = false;
  }

  // Checking quorum and majority and setting proposal fail if either of them is not reached
  // Calculating total vote count
  uint256 totalVotes = proposal.yesVote.add(proposal.noVote);
  // Modify result to false if quorum is not reached
  proposal.didPass = totalVotes.mul(100) > rDAO_totalShareSupply.mul(globalQuorum);
  // Modifying result to false if majority is not reached
  proposal.didPass = proposal.yesVote.div(totalVotes).mul(100) > globalMajority;

  // Closing the proposal
  proposal.isProposalOpen = false;

  // Substracting requested share # of proposal from the current totalSharesRequested counter
  totalSharesRequested = totalSharesRequested.sub(proposal.sharesRequested);

  if (proposal.didPass == true) {
    // Execution logic based on proposal type [proposal vs. application]
    // IF proposal then send funds to proposer if didPass == true
    // IF application then add applicant to members and mint his shares
    //
    // Proposal
    if (proposal.isProposalOrApplication == true) {
      // Send out funds to proposer
      proposal.proposer.transfer(proposal.fundingGoal);
    }
    // Application
    else if (proposal.isProposalOrApplication == false) {
      // Adding member shares
      members[proposal.applicant].shares = proposal.sharesRequested;
      // Emitting event of new joined member
      emit MemberJoinedGuild(proposal.applicant, proposal.sharesRequested);
    }
  }
  else if (proposal.didPass == false) {
      // Pay back external contributors
      /// @dev Needs implementation
  }
    // Return deposit to proposer
    proposal.proposer.transfer(globalProposalDeposit);

    // Paying processing reward to msg.sender
    msg.sender.transfer(globalProcessingReward);

    // Emitting event
    emit ProcessedProposal(proposal.proposalIndex, proposal.didPass);
}

/// @notice Allows guild members to quit the guild if a voting would draw undesired outcome for them
/// @dev not implemented yet
function rageQuit() public memberOnly {}

/// @notice Allows guild members to deposit funds to the guild in exchange for guild tokens
/// @dev not implemented yet
function depositFunds() public memberOnly {}

/// @notice Allows guild members to withdraw funds in exchange for guild tokens
/// @dev not implemented yet
function withdrawFunds() public memberOnly {}

/// @notice Allows external contributors to fund a particular proposal
/// @dev not implemented yet
function externalFundProposal() public memberOnly {}

/// @notice Allows external contributors to fund the guild bank generally
/// @dev not implemented yet
function externalFundDAO() public memberOnly {}

// Getter functions
// Allow contract to receive external general contributions that goes to the guild funds
///@notice Fallback function for the contract
function() external payable {}

}