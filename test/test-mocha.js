var should = require('should');
var assert = require('assert');
var request = require('supertest');
// var mongoose = require('mongoose');
// var winston = require('winston');
// var config = require('./config-debug');

describe('API', function() {
    // look here for inspiration https://thewayofcode.wordpress.com/2013/04/21/how-to-build-and-test-rest-api-with-nodejs-express-mocha/

    var baseURL = 'http://localhost:3000';
    // within before() you can run all the operations that are needed to setup your tests. In this case
    // I want to create a connection with the database, and when I'm done, I call done().
    before(function(done) {
        // In our tests we use the test db
        // mongoose.connect(config.db.mongodb);
        done();
    });

    // use describe to give a title to your test suite, in this case the tile is "Account"
    // and then specify a function in which we are going to declare all the tests
    // we want to run. Each test starts with the function it() and as a first argument
    // we have to provide a meaningful title for it, whereas as the second argument we
    // specify a function that takes a single parameter, "done", that we will use
    // to specify when our test is completed, and that's what makes easy
    // to perform async test!
    describe("Preview", function(){
      it("lets you preview correctly the first time", function(done){
        request(baseURL)
          .post("/preview")
          .send()
          .end(function(err, res) {
            // console.log("hello");
            if (err) {
              throw err;
            }
            res.status.should.equal(200);
            res.text.should.equal("Image is 5");
            done();
          });
      });

      it("does NOT let you preview again", function(done){
        request(baseURL)
          .post("/preview")
          .send()
          .end(function(err, res) {
            // console.log("hello");
            if (err) {
              throw err;
            }
            res.status.should.equal(200);
            res.text.should.equal("Image is 0");
            done();
          });
      });

      it("says previewed is true", function(done){
        request(baseURL)
          .get("/previewed")
          .send()
          .end(function(err, res) {
            if (err) {
              throw err;
            }
            res.status.should.equal(200);
            res.text.should.equal("Previewed is true");
            done();
          });
      });
    });

    describe("Purchasing", function(){
      it("lets you buy once", function(done){
        request(baseURL)
          .post("/purchase")
          .send()
          .end(function(err, res) {
            // console.log("hello");
            if (err) {
              throw err;
            }
            res.status.should.equal(200);
            res.text.should.equal("Success is true");
            done();
          });
      });

      it("does NOT let you buy again", function(done){
        request(baseURL)
          .post("/purchase")
          .send()
          .end(function(err, res) {
            // console.log("hello");
            if (err) {
              throw err;
            }
            res.status.should.equal(200);
            res.text.should.equal("Success is false");
            done();
          });
      });
    });


    describe("New", function(){
      it("correctly creates a new contract", function(done){
        request(baseURL)
          .post("/new")
          .send()
          .end(function(err, res) {
            // console.log("hello");
            if (err) {
              throw err;
            }
            res.status.should.equal(200);
            res.text.should.startWith("Your address is");
            done();
          });
      });
    });

});
