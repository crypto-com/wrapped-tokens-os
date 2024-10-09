# Deployment

## Deploy FiatTokenProxy contract

Deploy FiatTokenProxy implement contract and proxy contract, then initilize it immediately.

```
yarn hardhat deploy --network NETWORK --tags FiatTokenProxy
```

## Deploy ExchangeRateUpdater contract

Deploy ExchangeRateUpdater contract, and initilize it immediately.

```
yarn hardhat deploy --network NETWORK --tags ExchangeRateUpdater
```

## Deploy MintForwarder contract

Deploy MintForwarder contract, and initilize it immediately.

```
yarn hardhat deploy --network NETWORK --tags MintForwarder
```

## Setup

### Set oracle in StakedToken(FiatTokenProxy) contract

```
stakedToken.updateOracle(ExchangeRateUpdaterAddress)
```

### Configure minters in StakedToken(FiatTokenProxy) contract

We have two minters, one that mints tokens, other one that burns tokens.

```
// Configure minter that mints Token
stakedToken.configureMinter(mintForwarderAddress, ethers.constants.MaxUint256)

// Configure minter that burns Token
stakedToken.configureMinter(tokenBurnerAddress, ethers.constants.Zero)
```

### Configure callers to MintForwarder contract

We can add several callers that configure different allowance amounts and minting intervals.

```
// The allowance is 8000000000000000000000 with an interval of 14400.
mintForwarder.configureCaller(firstCallerAddress, 8000000000000000000000, 14400)

// The allowance is 1000000000 with an interval of 1 year (31536000 seconds).
mintForwarder.configureCaller(secondCallerAddress, 1000000000, 31536000)
```

### Configure callers to ExchangeRateUpdater contract

```
// The allowance is 273972602739726 with an interval of 1 day (86400 seconds).
exchangeRateUpdater.configureCaller(callerAddress, 273972602739726, 86400)
```

## Usage

* Mint Tokens
* Burn Tokens
* Update ExchangeRate
* Set Blacklister
