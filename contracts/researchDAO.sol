pragma solidity ^0.5.0;

// Importing SafeMath library for safe operations
import "github.com/OpenZeppelin/zeppelin-solidity/contracts/math/SafeMath.sol";

contract researchDAO {
  
using SafeMath for uint; // Defining to use SafeMath library for uint types

// Global constants

uint256 globalVotingPeriod;           // Default value is 30 days or 2.592e+6 seconds
uint256 globalGracePeriod;            // Default value is 7 days or 604800 seconds
uint256 globalProposalDeposit;        // Default value is 10 ETH
uint256 globalProcessingReward;       // Default value is 0.1 ETH to incentivize processing; paid from funds. 
uint256 globalSummoningTime;          // The block.timestamp at contract deployment

//IERC20 public approvedToken; // approved token contract reference; default = wETH

// Limits thanks to Moloch DAO
// These numbers are quite arbitrary; they are small enough to avoid overflows when doing calculations
// with periods or shares, yet big enough to not limit reasonable use cases.
uint256 constant MAX_VOTING_PERIOD_LENGTH = 10**18; // maximum length of voting period
uint256 constant MAX_GRACE_PERIOD_LENGTH = 10**18; // maximum length of grace period
uint256 constant MAX_NUMBER_OF_SHARES = 10**18; // maximum number of shares that can be minted

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

struct Member {
    uint shares;
}

enum Vote {
    Null,   // default value
    Yes,
    No
}

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

mapping ( bytes => Proposal ) proposals;          // Storing proposals in a mapping based on proposalHash as an index
Proposal[] public proposalQueue;                  // Storing proposals in an array for queuing
mapping ( address => bytes[] ) proposalsOfMembers // Storing proposals for each member in an array

// Guild bank - These variables handle internal token and share allocations

mapping (address => uint) rDAO_tokenBalances; // Storing token balances for guild members
uint256 rDAO_totalTokenSupply;                // Counting the total supply minted

mapping (address => uint) rDAO_votingShares;  // Storing voting shares for guild members
uint rDAO_totalShareSupply;                   // Counting the total shares issued

// Modifiers

modifier memberOnly {
    require(members[msg.sender].shares > 0, "rDAO::memberOnly - not a member");
    _;
}


// Summoning constructor
  
  constructor() public { 

  }

// Functions


// Getter functions

}