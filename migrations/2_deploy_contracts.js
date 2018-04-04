var Evidence = artifacts.require("Evidence");

module.exports = function(deployer) {
  //uint _image, int _lat, int _long, uint _price, string _desc, address _receiver, uint _violation_type
  var image = 5;
  var lat = 4200000000;
  var lon = -7300000000;
  var price = 12345;
  var desc = "hello";
  var creator = 0x627306090abaB3A6e1400e9345bC60c78a8BEf57;
  var receiver = 0xf17f52151EbEF6C7334FAD080c5704D77216b732;
  var violation_type = 1;
  deployer.deploy(Evidence, image, lat, lon, price, desc, creator, receiver, violation_type);
};
