# ConsenSys Bootcamp Final Project
**Author:** Adrian Lenard
**Date:** June 7th, 2019

## researchDAO
Research funding is mainly done in private rounds with high entry costs and multiple middle mans in the process. There must be an easier way to decentralize and accelerate research funding by letting relevant researchers and funders to join into guilds and govern their own funds. It allows members to propose ideas for research and let governing members decide if guild funds should be allocated for a particular idea. On the other hand it also allows external contributions to take place by letting anyone to transfer funds to the guild or a given proposal.

### Model
The basic workflow would be somewhat similar to crowdfunded models. Their model implies that without a market ready product you are able to measure possible success of a product (or service) by creating visual materials of the idea and putting it out for customers. Sites like **Kickstarter** uses the same method by allowing anyone (almost) to propose an idea with a rich description of it and let future customers pre-purchase the product. By crowdfunding the initial capital required to start a company it pre-filters the idea for market demand. Also it creates a secondary marketing effect as multiple sites start posting about cool ideas.

This researchDAO is similarly aims to pre-filter research ideas and host a platform where funding can happen using cryptocurrencies. The difference between a simple crowdfunding model and researchDAO is that the latter implements a guild like model to gather primary stakeholders and experts of research. The guild operates with a governance model implemented in the researchDAO protocol.

**If the idea passes the guild voting or reaches the required pre-set funding goal by external contributions** the funds are allowed to be collected by the proposer and start the researching of the idea.

**If the idea does not reaches the goal or passes the vote within a given timeframe** then the funds get reallocated to the funders, the proposal closes and the idea does not turn reality.

### Basic workflow of the researchDAO
![alt text][logo]

[logo]: img/ResearchDAO.png "researchDAO model"


### Governance method

Generally DAOs are governed by a voting mechanims that is a timeframe which allows members of the DAO to cast their votes on a given issue or proposal. Timeframes can vary based on the governance implementation: finite and infinite. The researchDAO implements a finite voting period set by the `globalVotingPeriod` The evaluation of the votes can happen with different settings (e.g.: quorum and majority).

**Quorum** is set with the `globalQuorum` and controls the participation requirements of a proposal vote. If the quorum is higher than the ratio of participated voting power then the proposal will fail. **Majority** is set with the `globalMajority` and is responsible of setting the ratio of yes votes required for a proposal to pass.

**There are two kinds of proposals in researchDAO.** The first mechanism is `member application and share allocation` withing the guild in order to form the stakeholders of the DAO. The second type is when somebody submits a `proposal for research`.

Internal voting is designed with simple rules in researchDAO. **Voting period is the time frame a proposal is open for voting.** The corresponding variable called `globalVotingPeriod`. Another period is defined in the DAO called `globalRagequitPeriod`, which serves as a grace period meanwhile voters who voted `No` on a proposal can call ragequit. The periods are calculated by comparing time spent since proposal submission derived from `block timestamps`. This method can bear risks by miner manipulation with a timeframe of ~30 seconds, but in the current model of the DAO this cannot effect any outcome, like in a [case of a decentralized exchange (DEX)](https://docs.binance.org/anti-frontrun.html).

**Processing reward** is defined to incentivize member to call processProposal function and therefore execute closing of an ended proposal. This reward is set by the `globalProcessingReward` and defaults to a minimal amount like 0.1ETH. Proposal deposit requirement is set by `globalProcessingReward` to help as an anti-spam method to disincentivize member of submitting a proposals and dilute other members focus on promising proposals.

<!--

> To account for the need for resilience, a.k.a incorruptibility, **DAOstack’s governance** templates separate `token ownership` and `voting power` into two different currencies. DAOstack generally refers to the first — the **fungible, transferable** token that is a form of monetary wealth — as simply token, called GEN token. The second — voting power — refers to as reputation. Reputation **cannot be directly transferred** from peer to peer, but rather is **distributed by the passing of proposals** to assign reputation, **or by the adoption of protocols that later result in reputation being transferred automatically**. For example, there might be a protocol through which reputation is distributed for positively reviewed work.
**Source:** [Medium/@daostack - An Explanation of DAOstack in Fairly Simple Terms](https://medium.com/daostack/an-explanation-of-daostack-in-fairly-simple-terms-d0e034739c5a)

Therefore the researchDAO includes two different values stored for every member's key. There is a differentiation between **ownership of funds** and **voting power**. When somebody purchases **rDAO token** his balance is incremented in the corresponding `rDAO_tokenBalances` mapping. It is a deposit made from ETH and being locked in, until you quit the DAO. These deposits make up the funds of the guild. It fluctuates as a new members enter or an existing quits.

```
mapping (address => uint) rDAO_tokenBalances;
uint rDAO_totalTokenSupply;
``` -->

### Reputation as voting power

**Voting power or reputation** is measured in `voting shares`. This is a token that can be minted by the guild bank by the allowance of the members of the DAO. This means that the power distribution happens in a collective manner, where members have the ability to `ragequit` anytime they like, to prevent undesired outcomes. For an example image a situation in which a member or a group of members owning >50% of voting power votes a proposal to allocate themselves ridiculously more shares and therefore diluting the other members in the guild. To prevent such circumstance `ragequit` is introduced based on the [**Moloch DAO**](https://github.com/MolochVentures/moloch/blob/5b804667c8ba0d35a472ccedb11934c3cfbf10ad/contracts/Moloch.sol#L334) implementation. After each proposal end, a **grace period** (`globalRagequitPeriod`) starts in which members who voted NO can still quit the guild and withdraw their funds before the proposal gets executed.

```
uint256 public rDAO_totalShareSupply;
uint256 public totalSharesRequested;
```

### Funding of the DAO

There are multiple ways the DAO can collect funds. First, there are **guild members** who are sending in funds while entering the guild. And there are also **external contributors** who does not want to enter the guild by applying for membership but wants to fund research efforts of people.

**Guild member funding** happens at the application process, when a new member would like to join. To submit an application it is required that an existing member should be approached to propose the application of the joining member.

**External funding** can happen by anyone from an address that does not belong to a guild member. Proposals are public and can be browsed by external parties. External contributors can fund the guild bank generally or a proposal directly.

Since only internal members are allowed to vote there is an exception designed to allow **publicly funded projects to skip internal voting.** If a proposal receive the required funding amount from external parties during the voting period it does not need to rely on member votes to proceed and on the funds of the guild. This also means that the proposal will close and execute fund distribution upon receiving the remaining amount of funds. *In an example when the proposal collects 50% of funds externally and gets voted by the internal members, the DAO only transfers the remaining 50% of the funds, therefore saves its funds.*

### Proposals
Anyone being a guild member can propose an `idea for research` or propose `application of a new member`. Both functions are handled by the same `submitProposa()` function. Every proposal need to include a `deposit` to prevent spamming, but after the proposal is processed and closed this amount is returned to the proposer.

#### Application proposal
Only an existing member can propose new joining applicants. This happens using the `submitProposal()` function also. The submitter needs to pass the applicant's address as well as the documentation of the joining members introduction and the shares he requests.

#### Research proposal
Only an existing member can propose an idea for research. He must create materials that are backing his future research plan. The more complex and sound the material is the more likely potential funders are going to belive in the proposer's idea. If the proposal passes by voting then the `fundingGoal` is allocated to the proposer from the guild bank. External contributions sent to the proposal are substracted from the `fundingGoal` and only the remaining amount is transferred from the guild bank.

A proposal has the following attributes:
* **proposalIndex** -> uint
* **proposer** -> address
* **title** -> string
* **documentationAddress** -> byte (IPFS address)
* **fundingGoal** -> uint
* **percentForSale** -> uint
* **isProposalOpen** -> bool
* **creationTimestamp** -> now
* **votesByMembers** -> mapping
* **yesVote** -> uint
* **noVote** -> uint
* **didPass** -> bool
* **externalFundsCollected** -> uint
* **isProposalOrApplication** -> bool

The documentation address is stored in a `byte32` storage to support **IPFS hash** and each proposal stores its corresponding document hash address. Optionally Swarm storage should be researched instead of **IPFS**. In case of **IPFS** integration a service like [**Pinata**](https://pinata.cloud/documentation#GettingStarted) should be used for pinning content. Storage needs implementation in the react interface, currently only the proposal variable supports IPFS hashes.

Funding goal is set in the `fundingGoal` variable and measures the maximum contributon limit, which triggers a successfully funded proposal closure and fund distribution.

**Members, votes and proposals** are stored in the following way:
```
struct Member {
    uint shares;
    uint tokens;
}

mapping (address => Member) public members;   // Storing member details in a mapping
address[] public memberArray;                 // Member array
```

```
enum Vote {
    Null,   // default value
    Yes,
    No
}
```

```
struct Proposal {     // This struct serves as the framework for a proposal to be submitted

    uint256 proposalIndex;  // the numeric ID of the proposal
    address proposer;   // the address of the submitter
    address applicant;  // the applicant address who would like to join
    uint256 sharesRequested;  // shares requested for the proposed member
    string  title;  // simple title for the proposal, e.g.: Adrian L. new membership proposal
    bytes32 documentationAddress;   // IPFS hash of the detailed documentation, e.g.: research project description
    uint256 fundingGoal;  // amount of the required funding, this is allocated from guild funds or collected from external contributors
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

// Storing proposals in a mapping based on proposalHash as an index
mapping ( bytes => Proposal ) proposals;

// Storing proposals in an array for queuing
Proposal[] public proposalQueue;

mapping ( address => uint256[] ) proposalsOfMembers
```

Creating a mapping for proposers' Ethereum addresses and corresponding proposals based on `proposalIndex`. As a proposer can submit multiple proposals it is stored in an array of uint. It helps contract execution to save on gas fees instead of looping to parse proposer addresses in proposals mapping.

By storing also the maximum total shares at the last yes vote on a proposal (`maxTotalSharesAtYesVote`) helps to calculate dilution multiplier when a proposal would execute to safe guard members who did not ragequit of the effects of dilution. Mapping stores a `proposalIndex` mapped to the number of maximum number of total shares outstanding at the last yes vote.
```
mapping(uint256 => uint256) public maxTotalSharesAtYesVote;
```


### Functions not implemented yet
There are some functionality that has not been developed due to the closeness of project deadline. The `external funding` and `ragequit` functions are not implemented and also its corresponding logic like external fund and internal voting distribution when processing a proposal. Another logic is missing that would be responsible to only allow proposals to be submitted that can be funded from the actual funds of the DAO and somehow it should limit proposal submission or lock-up funds for proposals. *In return it would avoid situations where for example the total funds are 100ETH and two proposals are submitted and voted yes with a funding goal of 60ETH each.*

## [Design pattern decisions document](design_pattern_decisions.md)
## [Avoiding common attacks document](avoiding_common_attacks.md)

## Dependencies

* truffle
* ganache
* npm

## Install instructions

Contracts are stored in `contracts/` folder and the react interface is under `client/`.

### 1. step - clone the repo

```
git clone https://github.com/adradr/Consensys-Bootcamp-Final-Project-researchDAO.git

cd ConsenSys-Bootcamp-Final-Project-researchDAO
```
### 2. step - ganache

Run your development network with ganache-cli or open ganache GUI
```
ganache-cli
```
Create a new workspace and set development port to `7545` or change it in `truffle-config.js`

### 3. step - truffle

The main contract, researchDAO.sol is deployed with multiple constructor arguments. In order to configure these you can edit `deployment-params.js` in root.

To compile and deploy contract run:
```
truffle migrate
```
This command will compile contracts and deploy them to the development network. At this point you will be able to see the deployed contract address in ganache.

To run unit test run:
```
truffle test
```
This runs the `rdao.js` test file under `tests/`

### 4. step - run react interface

To be able to interact with the contract in a browser you need to follow these steps:
```
cd client/
npm run recompiled  // it copies newly compiled ABIs
npm run start
```
This will launch your development server at `http://localhost:3000`

### 5. step - copy address MNEMONIC into MetaMask wallet

To be able to interact with the contract in a browser you also need to import your mnemonic words of your ganache accounts into MetaMask

## How to run

In order to successfully experiment with the contract you need to edit deployment parameters. (*Suggestion: set globalVotingPeriod to 60 or 120 seconds to eliminate excessive waiting to process proposal*) After deploying the contract there will be only one member of the DAO, the address which deployed the contract (`accounts[0]`).

### Flow of the DAO:

**Submit proposal for new member application**
1. Submit a proposal for new applicant
2. Confirm application from the proposed applicants address (`accounts[1]`)
3. Vote **YES** from the deployer address (`accounts[0]`)
4. Wait for the voting period to pass, and call processProposal()
5. Check the newly added member to the DAO.

**Submit proposal for research**
1. Submit proposal for research
2. Vote with member accounts (`accounts[0]` and `accounts[1]`)
3. Process the proposal after voting period passed.

## Ideas:
* ENS implementation for the contract

## Sources
Moloch DAO - https://github.com/MolochVentures/Whitepaper/blob/master/Whitepaper.pdf

## Evaluation checklist

- [x] README.md
- [ ] [mythril](https://github.com/ConsenSys/mythril) security audit
- [ ] Screen recording [!!]
- [x] Truffle project - compile, migrate, test
- [x] Commented project
- [x] Library use
- [ ] Local development interface
    - [x] Displays the current ETH Account
    - [x] Can sign transactions using MetaMask
    - [x] App interface reflects contract state
- [x] 5 tests in Js or Sol
    - [x] Structured tests
    - [x] All pass
- [x] Circuit breaker/Emergency stop
- [x] Project includes a file called design_pattern_desicions.md / at least 2 implemented
- [x] avoiding_common_attacks.md and explains at least 3 attacks and how it mitigates
- [ ] deployed_addresses.txt that indicates contract address on testnet
- [ ] IPFS
- [ ] upgradeable design pattern
- [ ] One contract written in Vyper or LLL
- [ ] uPort
- [ ] ENS
- [ ] Oracle

<!-- ## Not implemented future ideas

[**Percent for sale**]: Upon successful funding the proposer receives the funding and funders are entitled to research outcome rights based on the **percentForSale**. This variable sets the amount the proposer wishes to give away to crowdfunders of his research.]


The **[DAOstack](https://daostack.io)** framework invented a method called **Holographic consensus**, which basically allows proposals to be submitted and open for perpetuity. The submitted proposals can be voted yes with super majority. This initial pool can host huge numbers of proposals, which can be difficult for voters to browse for valuable proposals. Holographic consensus can mitigate this issue by introducing **staking** on these proposals by anyone with `GEN tokens`. By staking a proposal there is an incentive introduced for the stakers to promote the given propoposal. This method outsources the filtering of proposals by introducing incentives for proposal stakers.

**Boosted proposals** are transferred into a different pool, where there is a limited number of proposals, let's say 10. The introduction of a proposal to the boosted stack is based on a ranking order. This rank is calculated by the reputation of the voters already casted votes on the given proposal. Proposals are open for a finite time in the boosted stack and upon finalization a new proposal can enter to the boosted stack. Boosted stack represents only a relative majority of voters but attention is much higer on the promoted proposal list, as the queue size is limited to 10. Stakers of the finalized proposal are paid upon successful staking. Rewards are paid from the loss of unsuccessful stakers, which means a zero-sum game.

> To account for the need for resilience, a.k.a incorruptibility, **DAOstack’s governance** templates separate `token ownership` and `voting power` into two different currencies. DAOstack generally refers to the first — the **fungible, transferable** token that is a form of monetary wealth — as simply token, called GEN token. The second — voting power — refers to as reputation. Reputation **cannot be directly transferred** from peer to peer, but rather is **distributed by the passing of proposals** to assign reputation, **or by the adoption of protocols that later result in reputation being transferred automatically**. For example, there might be a protocol through which reputation is distributed for positively reviewed work.
**Source:** [Medium/@daostack - An Explanation of DAOstack in Fairly Simple Terms](https://medium.com/daostack/an-explanation-of-daostack-in-fairly-simple-terms-d0e034739c5a) -->