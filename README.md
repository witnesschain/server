
# Development

Start with this: http://truffleframework.com/tutorials/pet-shop

Pet-shop repo: https://github.com/truffle-box/pet-shop-box

This is ok but not that great: https://medium.com/etherereum-salon/hello-ethereum-solan-contract-4643118a6119

Use this IDE: https://github.com/ethereum/remix-ide

Test out contracts here: https://www.myetherwallet.com/#contracts

Solidity tips: https://ethereumbuilders.gitbooks.io/guide/content/en/solidity_tutorials.html

IPFS stuff: https://medium.com/@didil/off-chain-data-storage-ethereum-ipfs-570e030432cf

To make a Node.js server: https://ethereum.stackexchange.com/questions/24684/truffle-and-node-js
Example: https://github.com/gjeanmart/stackexchange/tree/master/24684-truffle-and-node-js

For production purposes, may need Geth instead of Ganache: https://hackernoon.com/ethereum-development-walkthrough-part-2-truffle-ganache-geth-and-mist-8d6320e12269

## Getting started

* Download Ganache from the website.
* `npm install`

## Running the server

* Double-click the Ganache icon to get it running.
* `npm restart`
* Then you can start running RESTful commands to interact with the blockchain via the API!

Any time you change the server code and want to restart, do `npm restart`.

## Testing

To test raw contracts: `truffle test`

Testing the API: `npm test`

## Ganache

Use this mnemonic:

```
candy maple cake sugar pudding cream honey rich smooth crumble sweet treat
```

## Using the API

See `test-mocha.js`, but for instance you can do:

```
  POST /new
    in body:
      image=12345
      creator_address=0x123abc
      receiver_address=0x456def
    it will return the `address` of the created contract

  GET /previewed
    in body:
      contract_address=0x333bbb
    it will return a boolean `previewed` saying if the contract has been previewed 
```
