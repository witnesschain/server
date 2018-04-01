pragma solidity ^0.4.21;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Evidence.sol";

contract TestEvidence {
  Evidence evidence = Evidence(DeployedAddresses.Evidence());

  uint image = 5;
  int lat = 4200000000;
  int lon = -7300000000;
  uint price = 12345;
  string desc = "hello";
  address receiver = 0x12345678901234567890;
  uint violation_type = 1;
  Evidence evid = new Evidence(image, lat, lon, price, desc, receiver, violation_type);


  function testDumb() public {
    uint a = 5;
    Assert.equal(a, a, "hello world");
  }

  function testBasicEvidence() public {
    uint a = 6;
    uint asq = evidence.square(a);
    uint asqExpected = a * a;
    Assert.equal(asq, asqExpected, "square works");
  }

  function testPreview() public {
    // ensure we get the right image out in preview
    uint imageOut = evid.preview();
    Assert.equal(image, imageOut, "Preview should return original image");

    // ensure the preview thing is set properly
    bool previewed = evid.previewed();
    Assert.equal(previewed, true, "Preview should set previewed=true");
  }

  function testMoney() public {
    bool out = evid.eatMoney.value(5 ether).gas(1000000000)();
    /* bool out = evid.eatMoney(); */

    Assert.equal(out, true, "should be enough money");
  }
}
