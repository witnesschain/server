var should = require('should');
var assert = require('assert');
var request = require('supertest');
// var mongoose = require('mongoose');
// var winston = require('winston');
// var config = require('./config-debug');

describe('API', function() {
    // look here for inspiration https://thewayofcode.wordpress.com/2013/04/21/how-to-build-and-test-rest-api-with-nodejs-express-mocha/

    const baseURL = 'http://localhost:3000';

    // params for the contract
    const IMAGE = 1636;
    const CREATOR_ADDRESS = '0xf17f52151EbEF6C7334FAD080c5704D77216b732';
    const RECEIVER_ADDRESS = '0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef';

    // we'll use a single consistent contract address for testing
    let contractAddress = null;

    // begin by creating a new contract to test with
    describe("New", function(){
      it("should create a new contract", function(done){
        request(baseURL)
          .post("/new")
          .send({
            image: IMAGE,
            creator_address: CREATOR_ADDRESS,
            receiver_address: RECEIVER_ADDRESS
          })
          .expect(200)
          .end(function(err, res) {
            // console.log("hello");
            if (err) {
              throw err;
            }

            // deconstruct json response
            let success = res.body.success;
            success.should.equal(true);

            contractAddress = res.body.address;
            contractAddress.should.startWith("0x");

            done();
          });
      });
    });

    describe("Preview", function(){
      it("lets you preview correctly the first time", function(done){
        request(baseURL)
          .post("/preview")
          .send({
            contract_address: contractAddress,
            receiver_address: RECEIVER_ADDRESS
          })
          .expect(200)
          .end(function(err, res) {
            // console.log("hello");
            if (err) {
              throw err;
            }

            // JSON gives us back the image int as a string, so parse it
            parseInt(res.body.image).should.equal(IMAGE);
            done();
          });
      });
    });
    //
    // // use describe to give a title to your test suite, in this case the tile is "Account"
    // // and then specify a function in which we are going to declare all the tests
    // // we want to run. Each test starts with the function it() and as a first argument
    // // we have to provide a meaningful title for it, whereas as the second argument we
    // // specify a function that takes a single parameter, "done", that we will use
    // // to specify when our test is completed, and that's what makes easy
    // // to perform async test!
    // describe("Preview", function(){
    //   it("lets you preview correctly the first time", function(done){
    //     request(baseURL)
    //       .post("/preview")
    //       .send()
    //       .end(function(err, res) {
    //         // console.log("hello");
    //         if (err) {
    //           throw err;
    //         }
    //         res.status.should.equal(200);
    //         res.text.should.equal("Image is 5");
    //         done();
    //       });
    //   });
    //
    //   it("does NOT let you preview again", function(done){
    //     request(baseURL)
    //       .post("/preview")
    //       .send()
    //       .end(function(err, res) {
    //         // console.log("hello");
    //         if (err) {
    //           throw err;
    //         }
    //         res.status.should.equal(200);
    //         res.text.should.equal("Image is 0");
    //         done();
    //       });
    //   });
    //
    //   it("says previewed is true", function(done){
    //     request(baseURL)
    //       .get("/previewed")
    //       .send()
    //       .end(function(err, res) {
    //         if (err) {
    //           throw err;
    //         }
    //         res.status.should.equal(200);
    //         res.text.should.equal("Previewed is true");
    //         done();
    //       });
    //   });
    // });
    //
    // describe("Purchasing", function(){
    //   it("lets you buy once", function(done){
    //     request(baseURL)
    //       .post("/purchase")
    //       .send()
    //       .end(function(err, res) {
    //         // console.log("hello");
    //         if (err) {
    //           throw err;
    //         }
    //         res.status.should.equal(200);
    //         res.text.should.equal("Success is true");
    //         done();
    //       });
    //   });
    //
    //   it("does NOT let you buy again", function(done){
    //     request(baseURL)
    //       .post("/purchase")
    //       .send()
    //       .end(function(err, res) {
    //         // console.log("hello");
    //         if (err) {
    //           throw err;
    //         }
    //         res.status.should.equal(200);
    //         res.text.should.equal("Success is false");
    //         done();
    //       });
    //   });
    // });

});
