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

  }

  function purchase() {

  }

  function setCompleted(uint completed) restricted {
    last_completed_migration = completed;
  }

  function upgrade(address new_address) restricted {
    Migrations upgraded = Migrations(new_address);
    upgraded.setCompleted(last_completed_migration);
  }
}
