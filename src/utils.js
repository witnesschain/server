let ip = require('ip')

const IP_PORT = 3000
const IP_ADDRESS = ip.address()

exports.getServerAddress = () => IP_ADDRESS
exports.getServerPort = () => IP_PORT

/**
  Returns the IP address and port that the Node server will run on,
  formatted as a URL.
*/
exports.getServerURL = () => `http://${IP_ADDRESS}:${IP_PORT}`

/*
  Converts a string gotten from Solidity - which may have trailing \u0000's -
  into a nice normal string.
*/
exports.cleanSolidityString = (str) => str.replace(/\0[\s\S]*$/g,'')
