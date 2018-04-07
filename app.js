// Express.js server file

// Import libraries
var Web3            = require('web3'),
    contract        = require("truffle-contract"),
    path            = require('path'),
    BigNumber       = require('bignumber.js');
    EvidenceJSON  = require(path.join(__dirname, 'build/contracts/Evidence.json')),
    express       = require('express');

// Set up Truffle stuff
var provider = new Web3.providers.HttpProvider("http://localhost:7545");

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
      res.error("Instance does not exist")
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

  /** 
  yo
  (node:6056) UnhandledPromiseRejectionWarning: TypeError: number.lessThan is not a function
      at Object.fromDecimal (/Users/neel/Git/witnesschain-server/node_modules/truffle-contract/node_modules/web3/lib/utils/utils.js:254:19)
      at /Users/neel/Git/witnesschain-server/node_modules/truffle-contract/node_modules/web3/lib/web3/formatters.js:109:30
      at Array.forEach (<anonymous>)
      at inputTransactionFormatter (/Users/neel/Git/witnesschain-server/node_modules/truffle-contract/node_modules/web3/lib/web3/formatters.js:108:8)
      at /Users/neel/Git/witnesschain-server/node_modules/truffle-contract/node_modules/web3/lib/web3/method.js:89:28
      at Array.map (<anonymous>)
      at Method.formatInput (/Users/neel/Git/witnesschain-server/node_modules/truffle-contract/node_modules/web3/lib/web3/method.js:88:32)
      at Method.toPayload (/Users/neel/Git/witnesschain-server/node_modules/truffle-contract/node_modules/web3/lib/web3/method.js:114:23)
      at Eth.send [as sendTransaction] (/Users/neel/Git/witnesschain-server/node_modules/truffle-contract/node_modules/web3/lib/web3/method.js:139:30)
      at SolidityFunction.sendTransaction (/Users/neel/Git/witnesschain-server/node_modules/truffle-contract/node_modules/web3/lib/web3/function.js:173:15)
  (node:6056) UnhandledPromiseRejectionWarning: Unhandled promise rejection. This error originated either by throwing inside of an async function without a catch block, or by rejecting a promise which was not handled with .catch(). (rejection id: 3)
  (node:6056) [DEP0018] DeprecationWarning: Unhandled promise rejections are deprecated. In the future, promise rejections that are not handled will terminate the Node.js process with a non-zero exit code.

  */

  // TODO wrap this all in some meta checking code
  const purchase = async () => {
    if (instance != null) {
      console.log("yo")
      const purchaseResult = await instance.purchase(
        {from: '0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef',
        value: new BigNumber("2500000000000000000")})
      console.log(purchaseResult)

      res.send("BOUGHT")

      // if (previewResult.logs[0]) {
      //   const image = previewResult.logs[0].args.image
      //   console.log(image)
      //   res.send(`Image is ${image}`)
      // }
    }
    else {
      res.error("Instance does not exist")
    }
  }

  try {
    purchase()
  }
  catch (e) {
    console.error("Error: " + e)
  }
});

// access with http :3000/previewed
app.get('/previewed', (req, res) => {
  const previewed = async () => {
    if (instance != null) {
      var out = await instance.previewed.call();
      res.send(`Previewed is ${out}`);
    }
    else {
      res.error("Instance does not exist")
    }
  };

  try {
    previewed()
  }
  catch (e) {
    res.error("Error: " + e)
  }
});

  //
  // if (instance != null) {
  //     instance.preview({from: '0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef'})
  //       .then((result) => {
  //           if()
  //       });
  // }
// });

//
//     // return instance.bought.call({from: '0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef'});
//     return instance.preview({from: '0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef'});
// }).then(function(result) {
//     // TODO this stops working after the first time because previewed is set to true
//     // after the first run.
//     // see https://github.com/trufflesuite/truffle-contract/tree/c1f33f05a6119a97b7adf51d44d8644396c2d598
//     console.log(result);
//     console.log(result.logs[0].args.image);
//
//     return instance.previewed.call({from: '0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef'});
// }).then(function(result) {
//     console.log(result);
// }).catch(function(err){
//   console.log("ERROR: " + err);
// });
// // .error(function(err){
// //   console.log(err)
// // });
