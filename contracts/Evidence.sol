pragma solidity ^0.4.21;

contract Evidence {
  address public creator;
  address public receiver;
  int public latitude; //assume 6 decimal points. `int` == `int256` so we will have tons of storage.
  int public longitude; //assume 6 decimal points
  uint public timestamp;
  bytes32 image;
  bytes32 public description;
  uint public violation_type;
  bool public bought;
  bool public previewed;
  uint public price; //in Wei

  event Previewed(string image);
  event Purchased(bool success);
  

  function Evidence(bytes32 _image, int _lat, int _lon, uint _price, bytes32 _desc, address _creator, address _receiver, uint _violation_type) public {
    // constructor
    creator = _creator;
    receiver = _receiver;
    latitude = _lat;
    longitude = _lon;
    price = _price;
    image = _image;
    description = _desc;
    violation_type = _violation_type;
    price = _price;

    bought = false;
    previewed = false;

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
    Returns the image string, or "0" if it failed.
  */
  function preview() public onlyCreatorOrReceiver returns (bytes32 _image) {
    if (bought == true){
      // if person checking is the receiver? Can we check that?
      _image = image;
    } else {
      if (previewed == false){
        previewed = true;
        _image = image;
      } else {
        _image = "0";
      }
    }

    // you can't send return values for a transaction,
    // so we should raise an event instead
    // also, humans can't read bytes32 (you get some hex junk),
    // so convert to strings before sending stuff back
    emit Previewed(bytes32ToString(_image));
  }

  function purchase() public payable onlyReceiver returns (bool) {
    // TODO for all these functions, ensure that the caller is
    // the receiver
    bool success = false;

    if (msg.value >= price && bought == false) {
      // success, buy!
      bought = true;
      previewed = true;

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


  function getDescription() public returns (string) {
    return bytes32ToString(description);
  }


  // convert bytes32 to string
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
