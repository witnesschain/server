var Evidence = artifacts.require("Evidence");

module.exports = function(deployer) {
  //uint _image, int _lat, int _long, uint _price, string _desc, address _receiver, uint _violation_type
  var image = 5;
  var lat = 4200000000;
  var lon = -7300000000;
  var price = 12345;
  var desc = "hello";
  var creator = 12345678901234567890;
  var receiver = 12345678901234567890;
  var violation_type = 1;
  deployer.deploy(Evidence, image, lat, lon, price, desc, creator, receiver, violation_type);
};
