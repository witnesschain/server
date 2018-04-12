// Express.js server file

var Web3            = require('web3'),
    contract        = require("truffle-contract"),
    path            = require('path'),
    ip              = require('ip'),
    BigNumber       = require('bignumber.js'),
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
let publicReceivers = []


// ROUTING

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
    var image = req.body.image
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
      const newResult = await Evidence.new(image, lat, lon, price, desc, creator, receiver, violation_type, {from: creator, gas: 6721975 })
      // that gas limit is just the max that ganache offers, bit of a hack
      // otherwise we run out of gas with this method
      // console.log(newResult)
      const newContract = newResult.contract
      const newContractAddress = newContract.address

      console.log(`New contract created at ${newContractAddress}`)

      // store that we have created this contract
      // store some basic information about the contract here
      // some stuff should be dynamically retrieved such as previewed
      // and bought, but key stuff that we need to filter on (like creator and
      // receiver) should be here
      allContracts.push({
        address: newContractAddress,
        creator: creator,
        receiver: receiver
      })

      res.json({
        success: true,
        address: newContractAddress
      })
    }
    catch (e) {
      // console.log("ERROR: " + e)
      res.status(400).send("ERROR: " + e)
    }
});

// access with: http POST :3000/preview
app.post('/preview', async (req, res) => {
  try {
    let inst = await Evidence.at(req.body.contract_address)
    // console.log(inst)

    let previewResult = await inst.preview({
      from: req.body.receiver_address
    })

    // console.log(previewResult)

    if (previewResult.logs[0]) {
      const image = previewResult.logs[0].args.image
      // this image string may have lots of stupid trailing null chars (\u0000)
      // so trim them
      const cleanedImage = utils.cleanSolidityString(image)
      // console.log("image is " + cleanedImage)

      res.json({
        image: cleanedImage
      })
    }
  }
  catch(e) {
    // console.log(e)
    res.status(400).send("Error: " + e);
  }
});

app.get('/previewed', async (req, res) => {
  // console.log("you said " + req.query.contract_address);
  try {
    let inst = await Evidence.at(req.query.contract_address);

    var out = await inst.previewed.call();
    res.json({
      previewed: out
    });
  }
  catch(e) {
    // console.log(e)
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
      bought: await inst.bought.call(),
      previewed: await inst.previewed.call(),
    }
    console.log(result)

    res.json(result)
  }
  catch(e) {
    // console.log(e)
    res.status(400).send("Error: " + e)
  }
})

/**
  Just returns the list of all contacts that we have been storing
*/
app.get('/list_contracts', async (req, res) => {
  console.log("All created contracts: ")
  console.log(allContracts)
  res.json(allContracts)
})

app.post('/register_receiver', async (req, res) => {
  try {
    let receiver_address = req.body.receiver_address
    let receiver_name = req.body.receiver_name

    publicReceivers.push({
      address: receiver_address,
      name: receiver_name
    })

    res.send("Registered")
  }
  catch(e) {
    res.status(400).send("Error: " + e)
  }
})

app.get('/list_receivers', async (req, res) => {
  res.json(publicReceivers)
})
