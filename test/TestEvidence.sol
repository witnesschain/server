pragma solidity ^0.4.21;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Evidence.sol";

contract TestEvidence {
  // Truffle will send the TestContract some Ether after deploying the contract.
  uint public initialBalance = 5 ether;

  Evidence evidence = Evidence(DeployedAddresses.Evidence());

  uint[] clearImages = [1234, 2345, 3456, 4567];
  uint[] blurredImages = [1111, 2222, 3333, 4444];
  int lat = 42000000;
  int lon = -73000000;
  uint price = 1 ether;
  bytes32 desc = "hello";
  address creator = 0xf17f52151EbEF6C7334FAD080c5704D77216b732;
  address receiver = this;
  uint violation_type = 1;
  Evidence evid = new Evidence(clearImages, blurredImages, lat, lon, price, desc, creator, receiver, violation_type);

  function testDumb() public {
    // just to make sure the testing suite works
    uint a = 5;
    Assert.equal(a, a, "hello world");
  }

  function testCreation() public {
    Assert.equal(evid.receiver(), this, "This contract is the receiver");
  }

  function testPreview() public {
    // ensure we get the blurred images out in preview
    uint[] imagesOut = evid.preview();
    Assert.equal(blurredImages, imagesOut, "Preview should return original blurred images");
  }

  function testPurchase() public {
    // we'll need this later, store it now
    address self = this;
    uint256 creatorBalanceBefore = creator.balance;
    uint256 ourBalanceBefore = self.balance;

    // 1 finney = 1/1000 ether
    // this should not purchase
    bool out = evid.purchase.value(10 finney)();
    bool bought = evid.bought();
    Assert.equal(out, false, "Payment should not succeed");
    Assert.equal(bought, false, "Not bought");
    uint256 creatorBalanceNoTxn = creator.balance;
    uint256 ourBalanceNoTxn = self.balance;
    Assert.equal(creatorBalanceBefore, creatorBalanceNoTxn, "Creator should not be paid");
    Assert.equal(ourBalanceBefore, ourBalanceNoTxn, "Buyer should be refunded");

    // now pay the proper amount
    out = evid.purchase.value(3 ether)();
    Assert.equal(out, true, "Should be enough money for payment to succeed");
    bought = evid.bought();
    Assert.equal(bought, true, "Bought is true");
    uint[] imagesOut = evid.preview();
    Assert.equal(blurredImages, imagesOut, "Preview should return original blurred images");

    uint256 creatorBalanceAfter = creator.balance;
    uint256 creatorBalanceAfterPredicted = creatorBalanceBefore + price;
    uint256 ourBalanceAfter = self.balance;
    uint256 ourBalanceAfterPredicted = ourBalanceBefore - price;
    Assert.equal(creatorBalanceAfterPredicted, creatorBalanceAfter, "Creator should be paid");
    Assert.equal(ourBalanceAfterPredicted, ourBalanceAfter, "Buyer should pay");
  }

  // fallback fn
  function() public payable { }
}
