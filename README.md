
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

* Download Ganache from its website.
* `npm install`
* If you have a `build` folder, do `rm -rf build`. (This is where contracts are compiled into.)
* `truffle compile`

## Running the server

* Double-click the Ganache icon to get it running.
* `npm restart`
* Then you can start running RESTful commands to interact with the blockchain via the API!

Any time you change the server code and want to restart, do `npm restart`.

## Testing

For full testing, use `truffle test` (it calls both `TestEvidence.sol` and `test-mocha.js`).

To test JUST the API (`test-mocha.js`), use `npm test`.

Before you run tests, ensure the server is running! (Run the tests, `truffle test`, and the server, `npm restart`, in separate terminal tabs.)

For some reason, `npm test` is more reliable than `truffle test`. So prefer `npm test` when testing the API.

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

### Example

If you're using `httpie` the request (run at the command line) looks like this:

```
  http POST :3000/new image=12345 creator_address=0xf17f52151EbEF6C7334FAD080c5704D77216b732 receiver_address=0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef
```

You will get a response like this:

```
HTTP/1.1 200 OK
Connection: keep-alive
Content-Length: 71
Content-Type: application/json; charset=utf-8
Date: Sun, 08 Apr 2018 20:58:27 GMT
ETag: W/"47-HZ8tao84xrCSIDw3Bti+pmg1r7Q"
X-Powered-By: Express

{
    "address": "0x9e699d6c7ccf183f0b09675a9e867d1486eef85b",
    "success": true
}
```
