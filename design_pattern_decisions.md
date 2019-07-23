# Design pattern decisions

## Restricting access

In `researchDAO` contract there are multiple levels of restriction based on the address accessing the contract methods. There are modifiers that restrict access to `memberOnly` and `isSummoner`. Functions can be accessed only by being a member and circuit breaker switch is only permitted for the summoner (admin).

```
// memberOnly serves as the restriction modifier for calls to only allow members to call
modifier memberOnly {
    require(members[msg.sender].shares > 0, "rDAO::memberOnly - not a member of researchDAO");
    _;
}
// isSummoner serves as the restriction modifier for calls to only allow summer to call - used in circuit breaker
modifier isSummoner {
    require(msg.sender == globalSummonerAddress, "rDAO::isSummoner - not the summoner of researchDAO");
    _;
}
```

## Fail quickly and loud

There are tons of `require()` tags in the contracts at the begining of each function to quickly check requirements and fail if not met. Most function parameters are filtered using require to see if input values are not equal to zero or greater than maximum constant values in order to avoid overflow. The require filter is used in the begining of each function to avoid reentrancy attacks by throwing unmet conditions.

In most cases `transfer()` is used instead of `send()` as the latter throws in a silent way.

In `processProposal()` function an unsafe `call()` was implemented as both `transfer()` and `send()` fails due to gas limit issues. This line is executed as the last action in the function for security purpose.

```
msg.sender.call.value(globalProcessingReward);
```

## Circuit breaker

A simple circuit breaker is implemented to give ability to `summoner` of the DAO to pause it. This logically might need some tuning in order to create a more democratic method of pausing contract.

```

// Implementing circuit breaker logic
bool private stopped = false;

modifier stopInEmergency {
    if(!stopped)
    _;
}

modifier onlyInEmergency {
    require(stopped);
    _;
}
// Circuit breaker switch to freeze functions - can be only called by the summoner
function toggleContractFreeze() isSummoner public {
    stopped = !stopped;
}
```
## Mortal

The contract is destructable by `shutDownDAO()` function. This helps when upgrading the contract by sending back the funds to the summoner of the DAO.

```
// Mortal function to shut down contract on upgrade and send all of its funds to the summoner adderess
function shutDownDAO() public stopInEmergency isSummoner {
    selfdestruct(globalSummonerAddress);
}
```

## Upgradeability

Not implemented yet