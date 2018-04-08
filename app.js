// Express.js server file

var Web3            = require('web3'),
    contract        = require("truffle-contract"),
    path            = require('path'),
    BigNumber       = require('bignumber.js');
    EvidenceJSON  = require(path.join(__dirname, 'build/contracts/Evidence.json')),
    express       = require('express');

// Set up Truffle stuff
var provider = new Web3.providers.HttpProvider("http://localhost:7545");
// this is a web3 instance from https://github.com/ethereum/wiki/wiki/JavaScript-API
var web3 = new Web3(provider)

var Evidence = contract(EvidenceJSON);
Evidence.setProvider(provider);

// for now assume there's a global instance
var instance = null;
Evidence.deployed().then(function(_instance) {
    instance = _instance;
});

// set up express
var app = express();

app.listen(3000, () => console.log('Listening on port 3000'));


// ROUTING

// tester
app.get('/hello', function (req, res) {
  res.send('Hello!!')
});

// With HTTPie, run
//     http POST :3000/dummy
app.post('/dummy', (req, res) => {
  // run some test function
  const dummy = async () => {
    if (instance != null) {
      var out = await instance.dummy(8);
      res.send(`Your result is ${out}`);
    }
    else {
      res.send("ERROR");
    }
  }

  dummy();
});

app.post('/new', (req, res) => {
    const makeNew = async() => {
      // TODO read this in from the req object
      var image = 5;
      var lat = 4200000000;
      var lon = -7300000000;
      var price = "1000000000000000000"; // 1 ether, in wei
      var desc = "hello";
      var creator = "0xf17f52151EbEF6C7334FAD080c5704D77216b732";
      var receiver = "0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef";
      var violation_type = 1;

      try {
        const newResult = await Evidence.new(image, lat, lon, price, desc, creator, receiver, violation_type, {from: creator, gas: 6721975 })
        // that gas limit is just the max that ganache offers, bit of a hack
        // otherwise we run out of gas with this method
        console.log(newResult)
        const newContractAddress = newResult.contract.address
        // TODO send back a JSON object
        res.send(`Your address is ${newContractAddress}`)
      }
      catch (e) {
        res.status(400).send("ERROR: " + e)
      }
    }

    makeNew()
});

// access with: http POST :3000/preview
app.post('/preview', (req, res) => {
  // run the preview function, then return what was previewed
  const preview = async () => {
    if (instance != null) {
      console.log("hi")
      const previewResult = await instance.preview({from: '0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef'})
      console.log(previewResult)

      if (previewResult.logs[0]) {
        const image = previewResult.logs[0].args.image
        console.log(image)
        res.send(`Image is ${image}`)
      }
    }
    else {
      res.status(400).send("Instance does not exist")
    }
  }

  try {
    preview()
  }
  catch (e) {
    console.error("Error: " + e)
  }
});

// access with: http POST :3000/purchase
app.post('/purchase', (req, res) => {

  // TODO wrap this all in some meta checking code
  const purchase = async () => {
    if (instance != null) {
      console.log("yo")
      try {
        const purchaseResult = await instance.purchase({
          from: '0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef',
          value: web3.toWei("2", "ether")
        })
        console.log(purchaseResult)

        const args = purchaseResult.logs[0].args
        const success = args.success
        console.log(success)
        res.send(`Success is ${success}`)
      }
      catch (e) {
        res.status(400).send("ERROR: " + e)
      }

      // if (previewResult.logs[0]) {
      //   const image = previewResult.logs[0].args.image
      //   console.log(image)
      //   res.send(`Image is ${image}`)
      // }
    }
    else {
      res.status(400).send("Instance does not exist")
    }
  }

  purchase()
});

// access with http :3000/previewed
app.get('/previewed', (req, res) => {
  const previewed = async () => {
    if (instance != null) {
      var out = await instance.previewed.call();
      res.send(`Previewed is ${out}`);
    }
    else {
      res.status(400).send("Instance does not exist")
    }
  };

  try {
    previewed()
  }
  catch (e) {
    res.status(400).send("Error: " + e)
  }
});


app.get('/previewed2', (req, res) => {
  const previewed = async () => {
    console.log("You said " + req.query.contract_address);

    try {
      let inst = await Evidence.at(req.query.contract_address);
      console.log(inst);

      var out = await inst.previewed.call();
      res.send(`Previewed is ${out}`);
    }
    catch(e) {
      res.status(400).send("Error: " + e);
    }
  };

  previewed()
});
