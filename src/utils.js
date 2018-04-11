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
