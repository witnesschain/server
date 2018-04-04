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
Evidence.deployed().then(function(instance) {
    // console.log(instance);
    // console.log(Evidence);
    return instance.preview.call({from: '0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef'});
}).then(function(result) {
    console.log(result.toNumber());
}, function(error) {
    console.log(error);
});
