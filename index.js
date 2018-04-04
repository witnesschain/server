// NODE
// Import libraries
var Web3            = require('web3'),
    contract        = require("truffle-contract"),
    path            = require('path')
    EvidenceJSON  = require(path.join(__dirname, 'build/contracts/Evidence.json'));

var provider = new Web3.providers.HttpProvider("http://localhost:7545");

var Evidence = contract(EvidenceJSON);
Evidence.setProvider(provider);

// Use Truffle as usual
var instance;

Evidence.deployed().then(function(_instance) {
    instance = _instance;
    return instance.preview.call({from: '0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef'});
}).then(function(result) {
    console.log(result.toNumber());

    return instance.previewed();
}).then(function(result) {
    console.log(result);
});
// .error(function(err){
//   console.log(err)
// });
