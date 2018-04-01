pragma solidity ^0.4.2;

contract Evidence {
  address private creator;
  address public receiver;
  int latitude; //assume 8 decimal points
  int longitude; //assume 8 decimal points
  uint image;
  string description;
  uint violation_type;
  bool bought;
  bool previewed;
  uint price; //in Ether, assume 8 decimal places

  // modifier restricted() {
  //   if (msg.sender == owner) _;
  // }

  function Evidence(uint _image, int _lat, int _long, uint _price, string _desc, address _receiver, uint _violation_type) {
    // constructor
    creator = msg.sender;
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

  function preview() public constant returns (uint _image) {
    if (bought == true){
      // if person checking is the receiver? Can we check that?
      _image = image;
    } else {
      if (previewed == false){
        previewed = true;
        _image = image;
      }
    }
  }

  function purchase() {
    bought = true;
  }

}
