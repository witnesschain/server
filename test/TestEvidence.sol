pragma solidity ^0.4.21;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Evidence.sol";

contract TestEvidence {
  Evidence evidence = Evidence(DeployedAddresses.Evidence());


  function testDumb() public {
    uint a = 5;
    uint b = 5;
    Assert.equal(a, b, "wtf");
  }
}
