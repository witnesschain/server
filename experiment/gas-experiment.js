var should = require('should');
var assert = require('assert');
var request = require('supertest');
var utils = require('../src/utils.js');

// connect to server
const baseURL = utils.getServerURL()
console.log(`Experimenting at ${baseURL}`);


/* VARIABLES */
// params for the contracts
const CLEAR_IMAGES = ["buzz", "woody", "marlin", "nemo"]
const BLURRED_IMAGES = ["zzub", "ydoow", "nilram", "omen"]
const CREATOR_ADDRESS = '0xf17f52151EbEF6C7334FAD080c5704D77216b732'
const RECEIVER_ADDRESS = '0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef'
const LATITUDE = 42000000
const LONGITUDE = -73000000
const PRICE_ETHER = 1 // must be whole number
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


let testCreation = () => {
  const NUM_TO_CREATE = 10

  for (let i = 0; i < NUM_TO_CREATE; i++) {
    let result = createContract().expect(200).end(() => {
      console.log(`Contract ${i} done`)
    })
  }
}

testCreation()
