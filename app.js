// Express.js server file

var Web3            = require('web3'),
    contract        = require("truffle-contract"),
    path            = require('path'),
    ip              = require('ip'),
    BigNumber       = require('bignumber.js'),
    keythereum      = require("keythereum"),
    EvidenceJSON    = require(path.join(__dirname, 'build/contracts/Evidence.json')),
    express         = require('express'),
    bodyParser      = require('body-parser'),
    utils           = require('./src/utils.js');

// Set up Truffle stuff
var provider = new Web3.providers.HttpProvider("http://localhost:7545");
// this is a web3 instance from https://github.com/ethereum/wiki/wiki/JavaScript-API
var web3 = new Web3(provider)

var Evidence = contract(EvidenceJSON);
Evidence.setProvider(provider);

// sample instance for testing
var sampleInstance = null;
Evidence.deployed().then(function(_instance) {
    sampleInstance = _instance;
});

// set up express
var app = express();

// we want it broadcasting on our local IP address
let serverIPAddress = utils.getServerAddress()
let serverPort = utils.getServerPort()
let serverURL = utils.getServerURL()
app.listen(serverPort, serverIPAddress, () => console.log(`Listening on ${serverURL}`));

// to parse POST bodies
app.use(bodyParser.json());



// Global state
// list of all evidence contracts that have been created
let allContracts = []
// list of all publicly-named receivers. this is, e.g., police stations
// who want citizens to send them stuff.
let publicReceivers = {}


//// HELPER FUNCTIONS



//// ROUTING

// tester endpoints
app.get('/hello', function (req, res) {
  res.send('Hello!')
});

// simple squaring function, does NOT call solidity
app.post('/basic_square', (req, res) => {
  let x = parseInt(req.body.x)
  // console.log("x is " + x)
  let xSquared = x * x
  res.send("Answer: " + xSquared)
});

// cool squaring function, DOES call solidity
app.post('/fancy_square', async (req, res) => {
  let x = parseInt(req.body.x)
  console.log("x is " + x)
  try {
    const result = await sampleInstance.square.call(x)
    // console.log(result)
    // the `result` is a BigNumber, need to turn it into a normal number
    res.send("Answer: " + result.toNumber())
  }
  catch (e) {
    res.status(400).send("ERROR: " + e)
  }
});


app.post('/new', async (req, res) => {
    var clear_images = req.body.clear_images
    var blurred_images = req.body.blurred_images
    var lat = req.body.latitude
    var lon = req.body.longitude
    var price = req.body.price
    var desc = req.body.description
    var creator = req.body.creator_address
    var receiver = req.body.receiver_address
    var violation_type = req.body.violation_type

    // console.log("Body is")
    // console.log(req.body)

    try {
      const newResult = await Evidence.new(clear_images, blurred_images, lat, lon, price, desc, creator, receiver, violation_type, {from: creator, gas: 6721975 })
      // that gas limit is just the max that ganache offers, bit of a hack
      // otherwise we run out of gas with this method
      // console.log(newResult)
      const newContract = newResult.contract
      const newContractAddress = newContract.address

      console.log(`New contract created at ${newContractAddress}`)

      // store that we have created this contract
      // normally, we'd call the cnotract to get all this relevant data,
      // but that takes a long time so we'll use backup local copies of any data
      // that we're confident does not get changed in the contract
      let contractData = {
        address: newContractAddress,
        creator: creator,
        receiver: receiver,
        blurred_images: blurred_images,
        latitude: lat,
        longitude: lon,
        timestamp: newContract.timestamp.call().toNumber(),
        description: desc,
        violation_type: violation_type,
        price: price,
        // don't store price and bought cause those are dynamic
      }
      // store this locally
      allContracts.push(contractData)

      res.json({
        success: true,
        address: newContractAddress
      })
    }
    catch (e) {
      console.log("ERROR: " + e)
      res.status(400).send("ERROR: " + e)
    }
});

// access with: http POST :3000/preview
app.post('/preview', async (req, res) => {
  try {
    let inst = await Evidence.at(req.body.contract_address)

    // the returned body is a list of images as bytes32s
    // need to clean
    let rawImages = await inst.preview.call({
      from: req.body.receiver_address
    })
    let images = rawImages.map(utils.bytes32ToString)
    // console.log("PREVIEWED:", images)

    res.json({
      images: images
    })
  }
  catch(e) {
    console.log(e)
    res.status(400).send("Error: " + e);
  }
});

app.post('/purchase', async (req, res) => {
  try {
    let inst = await Evidence.at(req.body.contract_address)

    let purchaseResult = await inst.purchase({
      from: req.body.receiver_address,
      value: web3.toWei(req.body.money_amount + "", req.body.money_unit)
    })
    // console.log(purchaseResult)

    const args = purchaseResult.logs[0].args
    const success = args.success
    console.log(`Purchase successful: ${success}`)
    res.json({
      success: success
    })
  }
  catch(e) {
    // console.log(e)
    res.status(400).send("Error: " + e)
  }
});

// get public data about a contract
app.get('/public_data', async (req, res) => {
  // console.log("you said " + req.query.contract_address)
  try {
    let inst = await Evidence.at(req.query.contract_address)

    var result = {
      creator: await inst.creator.call(),
      receiver: await inst.receiver.call(),
      // TODO specify cleaning functions for all of these? so no duplication
      blurred_images: (await inst.getBlurredImages.call()).map(utils.bytes32ToString),
      latitude: (await inst.latitude.call()).toNumber(),
      longitude: (await inst.longitude.call()).toNumber(),
      timestamp: (await inst.timestamp.call()).toNumber(),
      // don't access description directly; this getter will convert the dirty
      // bytes32 to a nice string
      // TODO cleaner way to do this? is there a built-in getter for description?
      description: utils.cleanSolidityString(await inst.getDescription.call()),
      violation_type: (await inst.violation_type.call()).toNumber(),
      // `price` is so huge that it might screw up the JS integer class
      // instead store it as a string
      price: (await inst.price.call()).toString(),
      bought: await inst.bought.call()
    }

    console.log(result)

    res.json(result)
  }
  catch(e) {
    console.log(e)
    res.status(400).send("Error: " + e)
  }
})

/**
  Just returns the list of all contacts that have been created
*/
app.get('/list_contracts', async (req, res) => {
  // console.log("All created contracts: ")
  // console.log(allContracts)
  res.json(allContracts)
})

app.post('/register_receiver', async (req, res) => {
  try {
    let receiver_address = req.body.receiver_address
    let receiver_name = req.body.receiver_name

    // treat this like a set mapping address to name
    publicReceivers[receiver_address] = receiver_name

    res.send("Registered")
  }
  catch(e) {
    res.status(400).send("Error: " + e)
  }
})

app.get('/list_receivers', async (req, res) => {
  // console.log("All receivers: ")
  // console.log(publicReceivers)
  res.json(publicReceivers)
})


/*
 * Generates an Ethereum address.
 */
app.post('/address', async (req, res) => {
  try {
    // use the password to generate a public/private key and address
    let password = req.body.password

    // use keythereum to generate stuff
    // usage instructions of keythereum here: https://github.com/ethereumjs/keythereum
    // dk contains private key `privateKey`, initialization vector `iv`, salt `salt`
    // these are BUFFERS!
    let dk = keythereum.create()

    // now generate the address
    let keyObject = keythereum.dump(password, dk.privateKey, dk.salt, dk.iv)

    // return the key object, which contains the initialization vector
    // and salt already. just need to give the private key (which is a buffer
    // of random bytes, so we should export in readable format)
    res.json({
      keyObject: keyObject,
      // this reports the private key in hex
      privateKey: dk.privateKey.toString('hex')
    })
  }
  catch(e) {
    res.status(400).send("Error: " + e)
  }
})
