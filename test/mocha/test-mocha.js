var should = require('should');
var assert = require('assert');
var request = require('supertest');
var utils = require('../../src/utils.js');

// var mongoose = require('mongoose');
// var winston = require('winston');
// var config = require('./config-debug');

// connect to server
const baseURL = utils.getServerURL()
console.log(`Testing at ${baseURL}`);



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


    /* VARIABLES */
    // params for the contracts
    const CLEAR_IMAGES = ["buzz", "woody", "marlin", "nemo"]
    const BLURRED_IMAGES = ["zzub", "ydoow", "nilram", "omen"]
    const CREATOR_ADDRESS = '0xf17f52151EbEF6C7334FAD080c5704D77216b732'
    const RECEIVER_ADDRESS = '0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef'
    const LATITUDE = 42000000
    const LONGITUDE = -73000000
    const PRICE_ETHER = 20 // must be whole number
    const PRICE_WEI_STRING = PRICE_ETHER + "000000000000000000"
    const DESCRIPTION = "My Description!"
    const VIOLATION_TYPE = 1


    // convenience functions
    let createContract = () => {
      // makes a POST request to make a new contract
      // and returns an object you can call end(), expect(), etc on.
      return request(baseURL)
        .post("/new")
        .send({
          clear_images: CLEAR_IMAGES,
          blurred_images: BLURRED_IMAGES,
          creator_address: CREATOR_ADDRESS,
          receiver_address: RECEIVER_ADDRESS,
          latitude: LATITUDE,
          longitude: LONGITUDE,
          price: PRICE_WEI_STRING,
          description: DESCRIPTION,
          violation_type: VIOLATION_TYPE
        })
    }

    // we'll use a single consistent contract address for testing
    // that is, we'll first create a brand-new contract, store its address here,
    // then use that contract for all future tests (except trivial ones)
    let contractAddress = null;

    // begin by creating a new contract to test with
    describe("New", function(){
      it("should create a new contract", function(done){
        createContract()
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
      it("should show blurred images on preview", function(done){
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

            // we should get the blurred images out
            let images = res.body.images
            images.should.deepEqual(BLURRED_IMAGES)

            done()
          });
      });
    });

    describe("Purchasing", function(){

      it("should NOT let you buy with insufficient funds", function(done) {
        // this is how much we'll try to buy with, in finney. It must be
        // less than the price of the contract.
        // a finney is 1/1000 of an ether and the price must be >= 1 ether
        // so just check that we are giving a small enough amount
        const INSUFFICIENT_AMOUNT_FINNEY = 50
        INSUFFICIENT_AMOUNT_FINNEY.should.be.lessThan(1000)


        request(baseURL)
          .post("/purchase")
          .send({
            contract_address: contractAddress,
            receiver_address: RECEIVER_ADDRESS,
            // this is a trivially small amount
            money_amount: INSUFFICIENT_AMOUNT_FINNEY,
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

      it("should NOT let the wrong person buy", function(done){
        const WRONG_ADDRESS = 0x5AEDA56215b167893e80B4fE645BA6d5Bab767DE;

        request(baseURL)
          .post("/purchase")
          .send({
            contract_address: contractAddress,
            receiver_address: WRONG_ADDRESS,
            // pay just enough money to pass
            money_amount: PRICE_ETHER + 1,
            money_unit: "ether"
          })
          .expect(400)
          .end(function(err, res) {
            if (err) {
              throw err
            }

            done()
          });
      });

      it("should let you buy with sufficient funds", function(done) {
        request(baseURL)
          .post("/purchase")
          .send({
            contract_address: contractAddress,
            receiver_address: RECEIVER_ADDRESS,
            // pay just enough money to pass
            money_amount: PRICE_ETHER + 1,
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
            // pay just enough money to pass
            money_amount: PRICE_ETHER + 1,
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

      it("should show clear images on preview", function(done){
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

            // we should get the clear images out
            let images = res.body.images
            images.should.deepEqual(CLEAR_IMAGES)

            done()
          });
      });
    });


    describe("Address Generation", () => {
      it("should correctly generate an Ethereum address", (done) => {
        request(baseURL)
          .post("/address")
          .send({
            password: "testpassword"
          })
          .expect(200).
          end((err, res) => {
            if (err) {
              throw err
            }

            // obviously, generating addresses is random, so we can't exactly
            // test the output values.
            // but we CAN test the structure.
            res.body.keyObject.should.be.ok()
            res.body.privateKey.length.should.equal(64)
            res.body.keyObject.address.length.should.equal(40)
            res.body.keyObject.crypto.cipherparams.iv.length.should.equal(32)

            done()
          })
      })
    })


    describe("Public Data", () => {

      it("should gather the right public data", (done) => {
        request(baseURL)
          .get("/public_data")
          .query({
            contract_address: contractAddress
          })
          .expect(200)
          .end(function(err, res) {
            if (err) {
              throw err
            }

            // address comparison
            // these strings are not always cased properly. sometimes
            // addresses get downcased somewhere along the way, but they're
            // still the same.
            res.body.creator.toLowerCase().should.equal(CREATOR_ADDRESS.toLowerCase())
            res.body.receiver.toLowerCase().should.equal(RECEIVER_ADDRESS.toLowerCase())

            // int comparison
            parseInt(res.body.latitude).should.equal(LATITUDE)
            parseInt(res.body.longitude).should.equal(LONGITUDE)
            parseInt(res.body.violation_type).should.equal(VIOLATION_TYPE)

            // for timestamp, we just wanna make sure this block was mined
            // around the right time. Just to be safe, let's say the block was mined
            // in +- 1 hour from right now.
            // Also, convert timestamps from Milliseconds to Seconds.
            const currentTimestamp = Math.floor(Date.now() / 1000)
            const earliestTime = currentTimestamp - 60 * 60
            const latestTime = currentTimestamp + 60 * 60
            parseInt(res.body.timestamp).should.be.above(earliestTime)
            parseInt(res.body.timestamp).should.be.below(latestTime)

            // string comparison
            res.body.description.should.equal(DESCRIPTION)
            res.body.price.should.equal(PRICE_WEI_STRING)

            // boolean comparison
            res.body.bought.should.equal(true)

            done()
          })
      })

      // we'll make a second address so we can test the global listing property
      let secondContractAddress = null

      it("should create a second test contract properly", (done) => {
        // so now we should have a list of 2 contracts
        createContract()
          .expect(200)
          .end(function(err, res) {
            // console.log("hello");
            if (err) {
              throw err;
            }

            // deconstruct json response
            let success = res.body.success;
            success.should.equal(true);

            secondContractAddress = res.body.address;
            secondContractAddress.should.startWith("0x");

            done();
          });
      })

      it("should list both created contracts", (done) => {
        request(baseURL)
          .get("/list_contracts")
          .query()
          .expect(200)
          .end(function(err, res) {
            if (err) {
              throw err
            }

            let returnedList = res.body

            // there may be many contracts before this
            // the 2nd-last one should be our first contract
            // and the last one should be our second contract
            let penultimateContract = returnedList[returnedList.length - 2]
            let lastContract = returnedList[returnedList.length - 1]
            penultimateContract.address.toLowerCase().should.equal(
              contractAddress.toLowerCase())
            lastContract.address.toLowerCase().should.equal(
              secondContractAddress.toLowerCase())

            // it should also name the right creators and receivers
            penultimateContract.receiver.toLowerCase().should.equal(
              RECEIVER_ADDRESS.toLowerCase())
            penultimateContract.creator.toLowerCase().should.equal(
              CREATOR_ADDRESS.toLowerCase())
            lastContract.receiver.toLowerCase().should.equal(
              RECEIVER_ADDRESS.toLowerCase())
            lastContract.creator.toLowerCase().should.equal(
              CREATOR_ADDRESS.toLowerCase())

            // and correctly name a few other parameters
            // just spot-checking here, there are many other parameters
            penultimateContract.latitude.should.equal(LATITUDE)
            lastContract.longitude.should.equal(LONGITUDE)

            done()
          })
      })

      const RECEIVER_NAME = "Police Station 123"

      it('should register a public receiver', (done) => {
        request(baseURL)
          .post("/register_receiver")
          .send({
            receiver_address: RECEIVER_ADDRESS,
            receiver_name: RECEIVER_NAME
          })
          .expect(200).
          end(function(err, res) {
            if (err) {
              throw err
            }

            res.text.should.equal("Registered")
            done()
          });
      })

    it('should list the registered receiver', (done) => {
      request(baseURL)
        .get("/list_receivers")
        .query()
        .expect(200)
        .end(function(err, res) {
          if (err) {
            throw err
          }

          // check that the desired address actually was registered
          // this is a sort of hashmap
          let lastReceiverName = res.body[RECEIVER_ADDRESS]
          lastReceiverName.should.equal(RECEIVER_NAME)

          done()
        })
    })
  })
});
