# Avoiding common attacks

## Using `now` alias `block.timestamp`
The researchDAO contract uses time based variables to calculate the proposal voting period end. This is done using the `now` since there is no risk of being attacked with front-running methods. This would only be an issue if the DAO would allow betting on proposal outcomes, where time can be crucial.

## Reentrancy attack
Reentrancy attacks can happen when an attacker would try to call  To avoid reentrancy attacks all method that are sending ether are written to execute send function at the very end of the method, after substracting balance variables.

## Integer overflows
In order to to avoid overflow vulnerabilities in the contract constant values have been set to limit the maximum value that can be used for specific variables. `SafeMath` library is used for every `uint` operation in the contract.

```
uint256 constant MAX_VOTING_PERIOD_LENGTH = 10**18;     // maximum length of voting period
uint256 constant MAX_GRACE_PERIOD_LENGTH = 10**18;      // maximum length of grace/ragequit period
uint256 constant MAX_PROPOSAL_DEPOSIT = 10**18;         // maximum number of proposal deposit that can be used
uint256 constant MAX_NUMBER_OF_SHARES = 10**18;         // maximum number of shares that can be minted
uint256 constant MAX_PROCESS_REWARD = 10**18;           // maximum number for processing reward that can be used
uint256 constant MAX_INITIAL_SHARE = 10**18;            // maximum number for initial share request that can be used
uint256 constant MAX_FUNDING_GOAL = 10**18;             // maximum number for funding that can be used
uint8 constant MAX_QUORUM = 10**2;                      // maximum number for quorum that can be used
uint8 constant MAX_MAJORITY = 10**2;                    // maximum number for majority that can be used
uint8 constant MAX_DILUTION_BOUND = 10**2;              // maximum number for dilution bound that can be used
```
## Forcibly Sending Ether to a Contract
As a `selfdestruct` function does not triggers `callback` function of a contract, a malicious agent can set the address of a vulnearble contract as `selfdestruct` target address, where funds are sent after destroying a contract. If contract logic would allow disallow a function to be called by using its `balance`, can allow malicious agents to send ether and access the disallowed function.

To avoid this attack vector, the researchDAO contract does not uses `balance`, instead using storage variables to keep track of balances in contract logic.

```
struct Member {
    uint256 shares;         // rDAO voting shares - voting power
    uint256 contribution;   // Checking who offered how much when joining
    bool exists;            // General switch to indicate if an address is already a member
}
mapping(address => Member) public members;   // Storing member details in a mapping
```
## Gas Limit DoS on a Contract via Unbounded Operations
Contract that has unforseeable long loops can suffer from gas limit problems. If a payout function for example would loop across unknown lenght of addresses, it may be multiple blocks in lenght.

Example:

```
function payOut() {
    uint256 i = nextPayeeIndex;
    while (i < payees.length && msg.gas > 200000) {
      payees[i].addr.send(payees[i].value);
      i++;
    }
    nextPayeeIndex = i;
}
```
To avoid these pitfalls the researchDAO contract `does not include any looping functions` and all payouts happen to a fixed number of addresses for every execution.

## Mythril report

Mythril was used to scan for security vulnerabilities. There are currently 3 low-severity vulnerabilities found in the contract. All of these are the same `SWC ID 110` that are corresponding to possible exceptions triggered.

>It is possible to trigger an exception (opcode 0xfe). Exceptions can be caused by type errors, division by zero, out-of-bounds array access, or assert violations. Note that explicit `assert()` should only be used to check invariants. Use `require()` for regular input checking.

The related functions are the following:
* `proposalsOfMembers(address,uint256)`
* `proposalQueue(uint256)`
* `memberArray(uint256)`

These security flaws are not really affecting the contract and its funds.

[Complete mythril report here!](mythril_results.txt)
