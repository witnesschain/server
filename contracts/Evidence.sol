pragma solidity ^0.4.21;

contract Evidence {
  address public creator;
  address public receiver;
  int public latitude; //assume 6 decimal points. `int` == `int256` so we will have tons of storage.
  int public longitude; //assume 6 decimal points
  uint public timestamp;
  uint[4] clearImages; // make as hard to access as possible for the unauthorized
  uint[4] public blurredImages;
  bytes32 public description;
  uint public violation_type;
  bool public bought;
  uint public price; //in Wei

  event Purchased(bool success);


  function Evidence(uint[4] _clearImages, uint[4] _blurredImages, int _lat, int _lon, uint _price, bytes32 _desc, address _creator, address _receiver, uint _violation_type) public {
    // constructor
    creator = _creator;
    receiver = _receiver;
    latitude = _lat;
    longitude = _lon;
    price = _price;
    clearImages = _clearImages;
    blurredImages = _blurredImages;
    description = _desc;
    violation_type = _violation_type;
    price = _price;

    bought = false;

    // timestamp is # of SECONDS since unix epoch that this block was mined
    // accurate to within +- 900 seconds
    // it's convenient to do this in ethereum so you don't have to pass it in
    // from the client (also, impossible for someone to fake it this way)
    timestamp = now;
  }

  modifier onlyReceiver() {
      // if a condition is not met then throw an exception
      if (msg.sender != receiver) revert();
      // or else just continue executing the function
      _;
  }

  modifier onlyCreator() {
      // if a condition is not met then throw an exception
      if (msg.sender != creator) revert();
      // or else just continue executing the function
      _;
  }

  modifier onlyCreatorOrReceiver() {
      // if a condition is not met then throw an exception
      if (msg.sender != creator && msg.sender != receiver) revert();
      // or else just continue executing the function
      _;
  }

  // dummy function
  function square(uint x) public returns (uint) {
    uint x2 = x * x;
    return x2;
  }

  /**
  * Returns the blurred images.
  */
  function preview() public constant returns (uint[4] _images) {
    _images = blurredImages;
  }


  function purchase() public payable onlyReceiver returns (bool) {
    // TODO for all these functions, ensure that the caller is
    // the receiver
    bool success = false;

    if (msg.value >= price && bought == false) {
      // success, buy!
      bought = true;

      // send `price` ethers to the creator who submitted it
      creator.transfer(price);

      success = true;
    }
    else {
      // not enough $$$
      success = false;
    }

    // refund any extra $$$ sent to this contract
    address self = this;
    msg.sender.transfer(self.balance);

    emit Purchased(success);
    return success;
  }

  // fallback fn
  function() public payable { }


  function getDescription() public constant returns (string) {
    return bytes32ToString(description);
  }


  // convert bytes32 (human-illegible) to string (legible!)
  // TODO: problem where string has a lot of dumb 0 characters at the end
  function bytes32ToString (bytes32 data) public pure returns (string) {
      bytes memory bytesString = new bytes(32);
      for (uint j=0; j<32; j++) {
          byte char = byte(bytes32(uint(data) * 2 ** (8 * j)));
          if (char != 0) {
              bytesString[j] = char;
          }
      }
      return string(bytesString);
  }



}
