// Express.js server file

// Import libraries
var Web3            = require('web3'),
    contract        = require("truffle-contract"),
    path            = require('path'),
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
      // const image = previewResult.logs[0].args.image
      // console.log(image)
      // let result = await instance.previewed.call()
      // let previewImage = result.logs[0].args.image
      // res.send(`Image is ${image}`)
      res.send("SUCCESS")
    }
    else {
      res.send("ERROR");
    }
  }

  preview();
});

// access with http :3000/previewed
app.get('/previewed', (req, res) => {
  const previewed = async () => {
    if (instance != null) {
      var out = await instance.previewed.call();
      res.send(`Previewed is ${out}`);
    }
    else {
      res.send("ERROR");
    }
  };

  previewed();
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
