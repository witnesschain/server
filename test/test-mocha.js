var should = require('should');
var assert = require('assert');
var request = require('supertest');
// var mongoose = require('mongoose');
// var winston = require('winston');
// var config = require('./config-debug');


const baseURL = 'http://localhost:3000';


describe('Dummy', function() {

  it("should pass a trivial test", function(done){
    if (3 === 3) {
      done();
    }
    else {
      throw new Error();
    }
  });

  it("should access API dummy function properly", function(done){
    request(baseURL)
      .get("/hello")
      .expect(200)
      .end(function(err, res) {
        // console.log("hello");
        if (err) {
          throw err;
        }

        res.text.should.equal("Hello!");

        done();
      });
  });
});

describe('API', function() {
    // look here for inspiration https://thewayofcode.wordpress.com/2013/04/21/how-to-build-and-test-rest-api-with-nodejs-express-mocha/

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
      it("should you preview the first time", function(done){
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

      it("should NOT you preview the second time", function(done){
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
            parseInt(res.body.image).should.equal(0);
            done();
          });
      });

      it("should say previewed is true", function(done){
        request(baseURL)
          .get("/previewed")
          .query({
            contract_address: contractAddress
          })
          .expect(200)
          .end(function(err, res) {
            // console.log("hello");
            if (err) {
              throw err;
            }

            res.body.previewed.should.equal(true);
            done();
          });
      });
    });

    describe("Purchasing", function(){

      it("should NOT let you buy with insufficient funds", function(done) {
        request(baseURL)
          .post("/purchase")
          .send({
            contract_address: contractAddress,
            receiver_address: RECEIVER_ADDRESS,
            money_amount: 50,
            money_unit: "finney"
          })
          .expect(200).
          end(function(err, res) {
            if (err) {
              throw err
            }

            res.body.success.should.equal(false)
            done()
          });
      });

      it("should let you buy with sufficient funds", function(done) {
        request(baseURL)
          .post("/purchase")
          .send({
            contract_address: contractAddress,
            receiver_address: RECEIVER_ADDRESS,
            money_amount: 2,
            money_unit: "ether"
          })
          .expect(200).
          end(function(err, res) {
            if (err) {
              throw err
            }

            res.body.success.should.equal(true)
            done()
          });
      });

      it("should NOT let you buy again", function(done) {
        request(baseURL)
          .post("/purchase")
          .send({
            contract_address: contractAddress,
            receiver_address: RECEIVER_ADDRESS,
            money_amount: 2,
            money_unit: "ether"
          })
          .expect(200).
          end(function(err, res) {
            if (err) {
              throw err
            }

            res.body.success.should.equal(false)
            done()
          });
      });
    });
});
