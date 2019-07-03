# Ethereum Developer Bootcamp Final Project
>Author: Adrian Lenard  
Date: Jun 7. 2019

This document is the main documentation for the project. 

## researchDAO
Research funding is mainly done in private rounds with high entry costs and multiple middle mans in the process. There must be an easier way to decentralize research funding and therefore enable anyone to collect funds for his idea. 

### Model
The basic workflow would be somewhat similar to crowdfunded startups. Their model implies that without a market ready product you are able to measure possible success of a product (or service) by creating a visual representation of the idea and putting it out for customers. Sites like **Kickstarter** uses the same method by allowing anyone (almost) to propose an idea with a rich description of it and let future customers pre-purchase the product. By crowdfunding the initial capital required to start a company it pre-filters the idea for market demand. Also it creates a secondary marketing effect as multiple sites start posting about cool ideas. 

This researchDAO is similarly aims to pre-filter research ideas and host a platform where funding can happen using cryptocurrencies. The difference between a simple crowdfunding model and researchDAO is that the latter implements a guild like model to gather primary stakeholders and experts of research. The guild operates with a governance model implemented in the protocol. 

**If the idea reaches the required pre-set funding goal** the funds are allowed to be collected by the proposer and start the researching of the idea. 

**If the idea does not reaches the goal within a given timeframe** then the funds get reallocated to the funders, the proposal closes and the idea does not turn reality. 

[**IDEA**: Upon successful funding the proposer receives the funding and funders are entitled to research outcome rights based on the **percentForSale**. This variable sets the amount the proposer wishes to give away to crowdfunders of his research.]

If the funding is successfull the distribution happens. Platform fees are deducted before transferring funds in ETH to the proposer. **Platform fee is set at 0.5% of total funding** received for the given research proposal. This fee supports developers of the platform. 


### Governance method

Generally DAOs are governed by a voting mechanims that is a timeframe which allows members of the DAO to cast their votes on a given issue or proposal. Timeframes can vary based on the governance implementation: finite and infinite. The evaluation of the votes can also happen with different settings (e.g.: quorum and majority).

**There are two kinds of proposals in researchDAO.** The first mechanism is `member application and share allocation` withing the guild in order to form the stakeholders of the DAO. The second type is when somebody submits a `proposal for research`. 

Internal voting is designed with simple rules in researchDAO. **Voting period takes 1 month for every proposal.** Within this timeframe a given proposal is open unless its is a research proposal and gets 100% funding from external contributors. 

Internal membership application and share minting can happen with super majority. It means in terms of researchDAO that 3/5 or 60% is required to pass a vote. 

Submitted proposal can be 



The **[DAOstack](https://daostack.io)** framework invented a method called **Holographic consensus**, which basically allows proposals to be submitted and open for perpetuity. The submitted proposals can be voted yes with super majority. This initial pool can host huge numbers of proposals, which can be difficult for voters to browse for valuable proposals. Holographic consensus can mitigate this issue by introducing **staking** on these proposals by anyone with `GEN tokens`. By staking a proposal there is an incentive introduced for the stakers to promote the given propoposal. This method outsources the filtering of proposals by introducing incentives for proposal stakers. 

**Boosted proposals** are transferred into a different pool, where there is a limited number of proposals, let's say 10. The introduction of a proposal to the boosted stack is based on a ranking order. This rank is calculated by the reputation of the voters already casted votes on the given proposal. Proposals are open for a finite time in the boosted stack and upon finalization a new proposal can enter to the boosted stack. Boosted stack represents only a relative majority of voters but attention is much higer on the promoted proposal list, as the queue size is limited to 10. Stakers of the finalized proposal are paid upon successful staking. Rewards are paid from the loss of unsuccessful stakers, which means a zero-sum game.

### Reputation as voting power

> To account for the need for resilience, a.k.a incorruptibility, **DAOstack’s governance** templates separate `token ownership` and `voting power` into two different currencies. DAOstack generally refers to the first — the **fungible, transferable** token that is a form of monetary wealth — as simply token, called GEN token. The second — voting power — refers to as reputation. Reputation **cannot be directly transferred** from peer to peer, but rather is **distributed by the passing of proposals** to assign reputation, **or by the adoption of protocols that later result in reputation being transferred automatically**. For example, there might be a protocol through which reputation is distributed for positively reviewed work.
**Source:** [Medium/@daostack - An Explanation of DAOstack in Fairly Simple Terms](https://medium.com/daostack/an-explanation-of-daostack-in-fairly-simple-terms-d0e034739c5a)

Therefore the researchDAO includes two different values stored for every member's key. There is a differentiation between **ownership of funds** and **voting power**. When somebody purchases **rDAO token** his balance is incremented in the corresponding `rDAO_tokenBalances` mapping. It is a deposit made from ETH and being locked in, until you quit the DAO.

```
mapping (address => uint) rDAO_tokenBalances;
uint rDAO_totalTokenSupply;
```

**Voting power or reputation** is measured in another form of token, called `voting shares`. This is also a token that can be minted by the guild bank by the allowance of the members of the DAO. This means that the power distribution happens in a collective manner, where members have the ability to `ragequit` anytime they like, to prevent undesired outcomes. For an example image a situation in which a member or a group of members owning >50% of voting power votes a proposal to allocate themselves ridiculously more shares and therefore diluting the other members in the guild. To prevent such circumstance `ragequit` is introduced based on the [**Moloch DAO**](https://github.com/MolochVentures/moloch/blob/5b804667c8ba0d35a472ccedb11934c3cfbf10ad/contracts/Moloch.sol#L334). After each proposal ended, a `grace period` starts in which members who voted NO can still quit the guild and withdraw their funds before the proposal gets executed.

```
mapping (address => uint) rDAO_votingShares;
uint rDAO_totalShareSupply;
```
### Funding of the DAO

There are multiple ways the DAO can collect funds. First, there are **guild members** who are sending in funds to enter the guild. And there are also **external contributors** who does not want to enter the guild by applying for membership but wants to fund research efforts of people. 

**Guild member funding** happens at the application process, when a new member would like to join. To submit an application it is required that an existing member should be approached to propose the joining member.

**External funding** can happen by anyone from an address that does not belong to a guild member. Proposals are public and can be browsed by external parties. External contributors can fund the guild bank generally or a proposal directly. 

Since only internal members are allowed to propose there is an exception designed to allow **publicly funded projects to skip internal voting.** If a proposal receive the required funding amount from external parties during the voting period it does not need to rely on member votes to proceed and on the funds of the guild. This also means that the proposal will close and execute fund distribution upon receiving the remaining amount of funds. 

### Proposals
Anyone using an Ethereum wallet could propose an idea for research. He must create materials that are backing his future research plan. The more complex and sound the material is the more likely potential funders are going to belive in the proposer's idea. 

A proposal has the following attributes:
* **proposalTitle** -> string
* **proposalDescription** -> string
* **proposalDocumentationAddress** -> byte (IPFS address)
* **proposalFundingGoal** -> uint
* **proposalPercentForSale** -> uint
* **proposalOwner** -> address
* **isProposalOpen** -> bool
* **proposalCreationTimestamp** -> now [(importing DateTime for human readable)](https://medium.com/@k3no/making-a-birthday-contract-858fd3f63618)

The documentation is stored on **IPFS** and the proposal stores its document hash address. Optionally Swarm storage should be researched instead of **IPFS**. In case of **IPFS** integration a service like [**Pinata**](https://pinata.cloud/documentation#GettingStarted) should be used for pinning content. 

Funding goal is set in the `fundingGoal` variable and measures the maximum contributon limit, which triggers a successfully funded proposal closure and fund distribution. 

The main index for a proposal would be a `proposalHash` that is derived from the **title, description and documentationAddress**. Based on this hash id the proposal is stored in a mapping named `proposals`. 

```
bytes proposalHash;
proposalHash = keccak256(_title, _description, _documentationAddress);
```
**Members, votes and proposals** are stored in the following way: 
```
struct Member {
    uint shares;
}

enum Vote {
    Null,   // default value
    Yes,
    No
}

struct Proposal {

    bytes proposalHash;
    address proposalOwner;

    string title;
    string description;
    byte documentationAddress;

    uint fundingGoal;
    uint percentForSale;

    bool isProposalOpen;
    uint creationTimestamp;

    mapping (address => Vote) votesByMember;

    }

// Storing proposals in a mapping based on proposalHash as an index
mapping ( bytes => Proposal ) proposals;

// Storing proposals in an array for queuing
Proposal[] public proposalQueue;
```

Creating a mapping for proposers' Ethereum addresses and corresponding proposals based on `proposalHash`. As a proposer can submit multiple proposals it is stored in an array of bytes.
```
mapping ( address => bytes[] ) proposalsOfMembers
```

### Document storage

Tutorial to implement for IPFS : https://medium.com/@angellopozo/uploading-an-image-to-ipfs-e1f65f039da4

Swarm documentation
https://swarm-guide.readthedocs.io/en/latest/introduction.html

## Dependencies
## Install instructions
## How to run

## Ideas:
* member proposing should have a deposit requirement to prevent spamming, but this deposit is returned in either successfull or failed member proposals
* ENS implementation for the contract

Sources: https://github.com/MolochVentures/Whitepaper/blob/master/Whitepaper.pdf