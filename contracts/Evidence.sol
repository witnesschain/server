pragma solidity ^0.4.21;

contract Evidence {
  address public creator;
  address public receiver;
  int public latitude; //assume 6 decimal points. `int` == `int256` so we will have tons of storage.
  int public longitude; //assume 6 decimal points
  uint public timestamp;
  bytes32[4] clear_images; // make as hard to access as possible for the unauthorized
  bytes32[4] public blurred_images;
  bytes32 public description;
  uint public violation_type;
  bool public bought;
  uint public price; //in Wei

  event Purchased(bool success);


  constructor(bytes32[4] _clear_images, bytes32[4] _blurred_images, int _lat, int _lon, uint _price, bytes32 _desc, address _creator, address _receiver, uint _violation_type) public {

    // TODO ensure that image arrays have length (0..4), i.e. [1..3]

    // constructor
    creator = _creator;
    receiver = _receiver;
    latitude = _lat;
    longitude = _lon;
    price = _price;
    clear_images = _clear_images;
    blurred_images = _blurred_images;
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
  * Returns the best images available to the receiver: the previews
  * if the receiver has not purchased, or the actual images if they have
  */
  function preview() public view onlyReceiver returns (bytes32[4] _images) {
    if (bought == true) {
      _images = clear_images;
    }
    else {
      _images = blurred_images;
    }
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

  // call this instead of getting blurred_images directly... that doesn't work
  // odly
  function getBlurredImages() public constant returns (bytes32[4]) {
    return blurred_images;
  }


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
