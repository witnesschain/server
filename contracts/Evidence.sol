pragma solidity ^0.4.21;

contract Evidence {
  address public creator;
  address public receiver;
  int latitude; //assume 8 decimal points
  int longitude; //assume 8 decimal points
  uint image;
  string description;
  uint violation_type;
  bool public bought;
  bool public previewed;
  uint price; //in Ether, assume 8 decimal places

  event Previewed(uint image);
  event Purchased(bool success);

  // ADD DATE TIME - https://github.com/pipermerriam/ethereum-datetime

  // modifier restricted() {
  //   if (msg.sender == owner) _;
  // }

  function Evidence(uint _image, int _lat, int _long, uint _price, string _desc, address _creator, address _receiver, uint _violation_type) public {
    // constructor
    creator = _creator;
    receiver = _receiver;

    latitude = _lat;
    longitude = _long;

    price = _price;

    description = _desc;

    violation_type = _violation_type;

    price = _price;

    bought = false;
    previewed = false;

    image = _image;

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

  function preview() public onlyCreatorOrReceiver returns (uint _image) {
    if (bought == true){
      // if person checking is the receiver? Can we check that?
      _image = image;
      emit Previewed(_image);
    } else {
      if (previewed == false){
        previewed = true;
        _image = image;
        emit Previewed(_image);
      } else {
        _image = 0;
        emit Previewed(_image);
      }
    }

    // you can't send return values for a transaction,
    // so we should raise an event instead
    /* emit Previewed(_image); */
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

}
