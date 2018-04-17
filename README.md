# WitnessChain

## Getting started

* Download Ganache from its website.
* `npm install -g truffle`
* `npm install`
* If you have a `build` folder, do `rm -rf build`. (This is where contracts are compiled into.)
* `truffle compile`

## Running the server

* Double-click the Ganache icon to get it running.
* `npm start`
* Then you can start running RESTful commands to interact with the blockchain via the API!

Any time you change the server code and want to restart, do `npm quickstart`.

## Testing

For full testing, use `truffle test` (it calls both `TestEvidence.sol` and `test-mocha.js`).

To test JUST the API (`test-mocha.js`), use `npm test`.

Before you run tests, ensure the server is running! (Run the tests, `truffle test`, and the server, `npm start`, in separate terminal tabs.)

For some reason, `npm test` is more reliable than `truffle test`. So prefer `npm test` when testing the API.

## Ganache

Use this mnemonic:

```
candy maple cake sugar pudding cream honey rich smooth crumble sweet treat
```

Make sure there are no spaces at the start or end of this string!!!

Your first address should be:

```
0x627306090abaB3A6e1400e9345bC60c78a8BEf57
```

## API Documentation

### `POST /new`
Creates a new address.

Parameters (in request body):

* `image : String` - a unique ID for the image (mad 32 characters). This may need to be a timestamp or something instead of the full URL, since this string can be no more than 32 characters.
* `latitude : Integer` - use 6 decimal places, so that latitude `42.5` becomes `42500000`
* `longitude : Integer` - same caveat as above
* `price : string` - a number in wei. It may be too big to store in JavaScript, so you can put the price in a string.
* `description : String` - no more than 32 characters long
* `creator_address : String` - a 40-character Ethereum address for the person who took the photos. Also include the `0x` at the front, making it 42 characters.
* `receiver_address : String` - a 40-character Ethereum address for the police station to receive the photos. Also include the `0x` at the front, making it 42 characters.
* `violation_type : Integer` - unused for now, just use `1`

Returns:

* `success : Boolean`
* `address : String` - the address of the newly-created contract. Also includes the `0x` at the front, making it 42 characters.



### `POST /preview`

Previews the public-facing image of the given evidence contract.

Parameters:

* `contract_address : String` - the address of the desired contract, from `/new`. Also include the `0x` at the front, making it 42 characters.
* `receiver_address : String` - the address of the police station that is previewing the evidence file (includes `0x`)

Returns:

* `image : String` - the previewed image id.


### `GET /previewed`

Tells you if the given evidence contract has been previewed.

Parameters:

* `contract_address : String` - the address of the desired contract, from `/new`. Also include the `0x` at the front, making it 42 characters.

Returns:

* `previewed : Boolean` - true if the contract has been previewed, false if not.



### `POST /purchase`

The police station buys this contract.

Parameters:

* `receiver_address : String` - the address of the police station that is buying the evidence file (includes `0x`)
* `contract_address : String` - the address of the desired contract, from `/new`. Also include the `0x` at the front, making it 42 characters.
* `money_amount : String/Number` - how much money, in `money_unit` units, the police station is offering. If you send too much money, you will be refunded anything above the price of the contract.
* `money_unit : String` - one of `wei`, `ether`, `finney`, or `szabo`.

Returns:

* `success: Boolean`


### `GET /public_data`

Returns all public data about a contract, given its address.

Parameters (in query/URL string):

* `contract_address : String` - the address of the desired contract, from `/new`. Also include the `0x` at the front, making it 42 characters.

Returns:

* creator
* receiver
* latitude
* longitude
* `timestamp : Integer` - Unix timestamp of creation
* description
* violation_type
* price
* `bought : Boolean`
* `previewed : Boolean`



### `GET /list_contracts`

Gives a full list of all contracts, including most public information about them.

Parameters: None.

Returns: an array of all contracts, each including information similar to what's returned by `public_data` - besides `bought` and `previewed` since those are not constant.


### `POST /address`

Randomly generates an Ethereum address and private key from a given password.

Parameters:

* `password : String` - a strong password that will be used to generate this address. Can be any length.

Returns a JSON object containing:

* `privateKey : String` - the generated private key, encoded in base 16. There's no `0x` here.
* `keyObject`, which looks like [what you see in `var keyObject` here](https://github.com/ethereumjs/keythereum#key-export)

You can find the address, initialization vector, and salt in the `keyObject`.



## Random links


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
