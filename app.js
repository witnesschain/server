// Express.js server file

var Web3            = require('web3'),
    contract        = require("truffle-contract"),
    path            = require('path'),
    BigNumber       = require('bignumber.js'),
    EvidenceJSON  = require(path.join(__dirname, 'build/contracts/Evidence.json')),
    express       = require('express'),
    bodyParser    = require('body-parser');

// Set up Truffle stuff
var provider = new Web3.providers.HttpProvider("http://localhost:7545");
// this is a web3 instance from https://github.com/ethereum/wiki/wiki/JavaScript-API
var web3 = new Web3(provider)

var Evidence = contract(EvidenceJSON);
Evidence.setProvider(provider);

// for now assume there's a global instance
// var instance = null;
// Evidence.deployed().then(function(_instance) {
//     instance = _instance;
// });

// set up express
var app = express();

app.listen(3000, () => console.log('Listening on port 3000'));

// to parse POST bodies
app.use(bodyParser.json());

// ROUTING

// tester
app.get('/hello', function (req, res) {
  res.send('Hello!')
});

app.post('/new', async (req, res) => {
    // TODO stop hardcoding, read all in from req
    var image = req.body.image;
    var lat = 4200000000;
    var lon = -7300000000;
    var price = "1000000000000000000"; // 1 ether, in wei
    var desc = "hello";
    var creator = req.body.creator_address
    var receiver = req.body.receiver_address
    var violation_type = 1;

    try {
      const newResult = await Evidence.new(image, lat, lon, price, desc, creator, receiver, violation_type, {from: creator, gas: 6721975 })
      // that gas limit is just the max that ganache offers, bit of a hack
      // otherwise we run out of gas with this method
      console.log(newResult)
      const newContractAddress = newResult.contract.address

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
    console.log(inst)

    let previewResult = await inst.preview({
      from: req.body.receiver_address
    })

    console.log(previewResult)

    if (previewResult.logs[0]) {
      const image = previewResult.logs[0].args.image
      console.log(image)

      res.json({
        image: image
      })
    }
  }
  catch(e) {
    res.status(400).send("Error: " + e);
  }
});

app.get('/previewed', async (req, res) => {
  console.log("you said " + req.query.contract_address);
  try {
    let inst = await Evidence.at(req.query.contract_address);

    var out = await inst.previewed.call();
    res.json({
      previewed: out
    });
  }
  catch(e) {
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
    console.log(purchaseResult)

    const args = purchaseResult.logs[0].args
    const success = args.success
    console.log(success)
    res.json({
      success: success
    })
  }
  catch(e) {
    res.status(400).send("Error: " + e)
  }
});
