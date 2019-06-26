# Ethereum Solidity Bootcamp final project
>Author: Adrian Lenard  
Date: Jun 7. 2019

This document is the main documentation for the project. 

## researchDAO
Research funding is mainly done in private rounds with high entry costs and multiple middle mans in the process. There must be an easier way to decentralize research funding and therefore enable anyone to collect funds for their idea. 

### Model
The basic workflow would somewhat similar to crowdfunded startups. Their model implies that without a market ready product you are able to measure possible success of a product (or service) by creating a visual representation of the idea and putting it out for customers. Sites like **Kickstarter** uses the same method by allowing anyone (almost) to propose an idea with a rich description of it and let future customers pre-purchase the product. By crowdfunding the initial capital required to start a company it pre-filters the idea for market demand.

**If the idea reaches the required pre-set funding goal** the funds are allowed to be collected by the proposer and start production of the idea. Finally, shipping products to the funding buyers.

**If the idea does not reaches the goal within a given timeframe** then the funds get reallocated to the funders and the proposal closes and the idea does not turn reality. 

Upon successful funding the proposer receives the funding and funders are entitled to research outcome rights based on the **percentForSale**. This variable sets the amount the proposer wishes to give away to crowdfunders of his research.

If the funding is successfull the distribution happens. Platform fees are deducted before transferring funds in ETH to the proposer. **Platform fee is set at 1% of total funding** received for the given research proposal.  

### Proposal
Anyone using an Ethereum wallet could propose an idea for research. He must create materials that are backing his future research plan. The more complex and sound the material is the more likely potential funders are going to belive in the proposer's idea. 

A proposal has the following attributes:
* title -> string
* description -> string
* documentationAddress -> byte (IPFS address)
* fundingGoal -> int
* percentForSale -> int
* proposalOwner -> address
* isProposalOpen -> bool
* creationTimestamp -> now [(importing DateTime for human readable)](https://medium.com/@k3no/making-a-birthday-contract-858fd3f63618)

The documentation is stored on **IPFS** and the proposal stores its document hash address. Optionally Swarm storage should be researched instead of **IPFS**. In case of **IPFS** integration a service like [**Pinata**](https://pinata.cloud/documentation#GettingStarted) should be used for pinning content. 

Funding goal is set in the fundingGoal variable and measures the maximum contributon limit, which triggers a successfully funded proposal closure and fund distribution. The proposer could set _________

The main index for a proposal would be a `proposalHash` that is derived from the **title, description and documentationAddress**. Based on this hash id the proposal is stored in a mapping named `proposals`. 

```
bytes proposalHash;
proposalHash = keccak256(_title, _description, _documentationAddress);

struct Proposal {

    bytes proposalHash;
    address proposalOwner;

    string title;
    string description;
    byte documentationAddress;

    int fundingGoal;
    int percentForSale;

    bool isProposalOpen;
    int creationTimestamp;

    }

mapping ( bytes => Proposal ) proposals;
```

Creating a mapping for proposers' Ethereum addresses and corresponding proposals based on `proposalHash`. As a proposer can submit multiple proposals it is stored in an array of bytes.
```
mapping ( address => bytes[] ) proposalsOfProposers
```

#### Documentation storage

Tutorial to implement for IPFS : https://medium.com/@angellopozo/uploading-an-image-to-ipfs-e1f65f039da4

Swarm documentation
https://swarm-guide.readthedocs.io/en/latest/introduction.html

#### Governance method

Generally DAOs are governed by a voting mechanims that is a timeframe which allows members of the DAO to cast their votes on a given issue or proposal. Timeframes can vary based on the governance implementation. The evaluation of the votes can also happen in different methods like quorum and majority. 

The **DAOstack** framework invented a method called **Holographic consensus**, which basically allows proposals to be submitted and open for perpetuity. The submitted proposals can be voted yes with super majority and quorum. This initial pool can host huge numbers of proposals, which can be difficult for voters to browse for valuable proposals. Holographic consensus can mitigate this issue by introducing **staking** on these proposals by anyone with `GEN tokens`. By staking a proposal there is an incentive introduced for the stakers to boost the given propoposal. 

Boosted proposals are transferred into a different pool, where there is a limited number of proposals, let's say 10. The introduction of a proposal to the boosted stack is based on a ranking order. This rank is calculated by the reputation of the voters already casted votes on the given proposal. Proposals are open for a finite time in the boosted stack and upon finalization a new proposal can enter to the boosted stack. Boosted stack represents only a relative majority of voters but attention is much higer on the promoted proposal list, as the queue size is limited to 10. Stakers of the finalized proposal are paid upon successful staking. Rewards are paid from the loss of unsuccessful stakers, which means a zero-sum game.

##### Reputation as voting power

> To account for the need for resilience, a.k.a. incorruptibility, **DAOstack’s governance** templates separate `token ownership` and `voting power` into two different currencies. DAOstack generally refers to the first — the **fungible, transferable** token that is a form of monetary wealth — as simply token, or GEN if we are talking about that specific token. The second — voting power — it refers to as reputation. Reputation **cannot be directly transferred** from peer to peer, but rather is **distributed by the passing of proposals** to assign reputation, **or by the adoption of protocols that later result in reputation being transferred automatically**. For example, there might be a protocol through which reputation is distributed for positively reviewed work.
**Source:** [Medium/@daostack - An Explanation of DAOstack in Fairly Simple Terms](https://medium.com/daostack/an-explanation-of-daostack-in-fairly-simple-terms-d0e034739c5a)

