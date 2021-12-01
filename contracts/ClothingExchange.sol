// SPDX-License-Identifier: MIT
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

pragma solidity 0.8.10;

contract ClothingExchange is AccessControl {

  AggregatorV3Interface internal priceFeed;
  bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

  enum State {
    EMPTY,
    LISTED,
    SOLD,
    SHIPPED,
    RECEIVED
  }

  enum Sizes {
    SMALL,
    MEDIUM,
    LARGE,
    XLARGE
  }

  uint public clothingCounter;
  uint public constant BARGAIN_ADDRESS_LIMIT = 5; // Limit the number of buyers that can bargain a garment

  struct Cloth {
    uint clothId;
    string name;
    uint initialPrice;
    string description;
    string brand;
    Sizes size;
    string recommendedAge;
    State state;
    address payable seller;
    address payable buyer;
    mapping (address => uint) tempPrice;
    uint tempPriceCounter;
    uint agreedPrice;
    address[] tempPriceAddresses;
  }

  mapping (uint => string) public trackingNumbers;

  mapping (uint => Cloth) public clothing;

  // Modifiers
  modifier isOwner () {
    require (hasRole(ADMIN_ROLE, msg.sender), "Is not owner");
    _;
  }

  modifier validPrice (uint _price) {
    require (_price > 0, "Price must be greater than 0");
    _;
  }

  modifier isListed (uint clothId) {
    require (clothing[clothId].state == State.LISTED);
    _;
  }

  modifier canBargain (address[] memory tempPriceAddresses) {
    require (tempPriceAddresses.length <= BARGAIN_ADDRESS_LIMIT);
    _;
  } 
  modifier isSold (uint clothId) {
    require (clothing[clothId].state == State.SOLD);
    _;
  }
  modifier isShipped (uint clothId) {
    require (clothing[clothId].state == State.SHIPPED);
    _;
  }
  modifier verifyCaller (address caller) {
    require (msg.sender == caller);
    _;
  }
  modifier paidEnough (uint price) {
    require (msg.value >= price);
    _;
  }
  modifier verifyExcessAmount (uint price) {
    _;
    uint refundValue = msg.value - price;
    if (refundValue > 0) {
      (bool _sent,) = msg.sender.call{value: refundValue}("");
      require(_sent);
    }
  }

  // Events
  event LogListClothingForSale (address seller, uint indexed clothCounter);
  event LogAddedBargain (address buyer, uint indexed clothId, uint newPrice);
  event LogConfirmedNewPrice (address buyer, uint indexed clothId, uint confirmedPrice);
  event LogClothingBought (address buyer, uint indexed clothId);
  event LogClothShipped (address seller, uint indexed clothId, string trackingNumber);
  event LogClothReceived (address buyer, uint indexed clothId);
  event LogOwnerCall (address owner);

  constructor () {
    _setupRole(ADMIN_ROLE, msg.sender);
    // Rinkeby data feed address 0x8A753747A1Fa494EC906cE90E9f37563A8AF630e
    priceFeed = AggregatorV3Interface(0x8A753747A1Fa494EC906cE90E9f37563A8AF630e);
  }

  function listClothingOnSell (
    string memory _name,
    uint _initialPrice,
    string memory _description,
    string memory _brand,
    string memory _recommendedAge,
    Sizes _size
  ) public validPrice(_initialPrice) returns (uint) {
    Cloth storage cloth = clothing[clothingCounter];
    cloth.clothId = clothingCounter;
    cloth.name = _name;
    cloth.initialPrice = _initialPrice;
    cloth.description = _description;
    cloth.brand = _brand;
    cloth.size = _size;
    cloth.recommendedAge = _recommendedAge;
    cloth.seller = payable(msg.sender);
    cloth.state = State.LISTED;
    clothingCounter = clothingCounter + 1;
    emit LogListClothingForSale(msg.sender, clothingCounter);
    return clothingCounter;
  }

  function addAddressToTempPriceAddresses (uint clothId, address buyer) private {
    bool inArray = false;
    Cloth storage c = clothing[clothId];
    require (c.tempPriceAddresses.length < BARGAIN_ADDRESS_LIMIT);
    for (uint i = 0; i < c.tempPriceAddresses.length; i++) {
      if (buyer == c.tempPriceAddresses[i]) {
	inArray = true;
	break;
      }
    }
    if (!inArray) {
      c.tempPriceAddresses.push(buyer);
    }
  }

  function bargainClothingPrice (
    uint clothId
  ) isListed(clothId) validPrice(msg.value) canBargain(clothing[clothId].tempPriceAddresses) public payable returns (bool) {
    address payable potentialBuyer = payable(msg.sender);
    Cloth storage c = clothing[clothId];
    c.tempPrice[potentialBuyer] = msg.value;
    c.tempPriceCounter += 1;
    addAddressToTempPriceAddresses(clothId, msg.sender);
    emit LogAddedBargain(potentialBuyer, clothId, msg.value);
    return true;
  }

  function confirmNewClothingPrice (
    uint clothId,
    address payable potentialBuyer
  ) verifyCaller(clothing[clothId].seller) validPrice(clothing[clothId].tempPrice[potentialBuyer]) isListed(clothId) public payable returns (bool) {
    Cloth storage c = clothing[clothId];
    c.agreedPrice = c.tempPrice[potentialBuyer];
    c.buyer = potentialBuyer;
    c.state = State.SOLD;
    (bool sent,) = c.seller.call{value: c.agreedPrice}("");
    require (sent);
    for (uint i = 0; i < c.tempPriceAddresses.length; i++) {
      address a = c.tempPriceAddresses[i];
      if (a != potentialBuyer) {
	(bool _sent,) = a.call{value: c.tempPrice[a]}("");
	require(_sent);
      }
    }
    emit LogConfirmedNewPrice(c.buyer, clothId, c.agreedPrice);
    return sent;
  }

  function buyClothingOnSell (
    uint clothId
  ) isListed(clothId) paidEnough(clothing[clothId].initialPrice) verifyExcessAmount(clothing[clothId].initialPrice) public payable returns (bool) {
    Cloth storage c = clothing[clothId];
    c.buyer = payable(msg.sender);
    c.state = State.SOLD;
    // transfer funds
    (bool sent,) = c.seller.call{value: c.initialPrice}("");
    require (sent);
    emit LogClothingBought(msg.sender, clothId);
    return sent;
  }

  function shipClothing (uint clothId, string memory trackingNumber) verifyCaller(clothing[clothId].seller) isSold(clothId) public {
    Cloth storage c = clothing[clothId];
    c.state = State.SHIPPED;
    trackingNumbers[c.clothId] = trackingNumber;
    emit LogClothShipped(c.seller, clothId, trackingNumber);
  }

  function receiveClothing (uint clothId) verifyCaller(clothing[clothId].buyer) isShipped(clothId) public {
    Cloth storage c = clothing[clothId];
    c.state = State.RECEIVED;
    emit LogClothReceived(c.buyer, clothId);
  }

  function getClothingById (uint clothId) public view returns (
    string memory name,
    string memory brand,
    string memory description,
    string memory recommendedAge,
    uint initialPrice,
    Sizes size,
    address seller,
    address buyer,
    State state,
    uint agreedPrice,
    address[] memory tempPriceAddresses
  ) {
    name = clothing[clothId].name;
    brand = clothing[clothId].brand;
    description = clothing[clothId].description;
    recommendedAge = clothing[clothId].recommendedAge;
    initialPrice = clothing[clothId].initialPrice;
    size = clothing[clothId].size;
    seller = clothing[clothId].seller;
    buyer = clothing[clothId].buyer;
    state = clothing[clothId].state;
    agreedPrice = clothing[clothId].agreedPrice;
    tempPriceAddresses = clothing[clothId].tempPriceAddresses;
  }

  function getClothingTempPrice (uint clothId, address buyer) public view returns (uint suggestedPrice) {
    suggestedPrice = clothing[clothId].tempPrice[buyer];
  }

  function getTrackingNumber (uint clothId) public view returns (string memory) {
    return trackingNumbers[clothId];
  }

  function mockGetLatestPrice () public pure returns (uint80 _roundID, int _price, uint _startedAt, uint _timeStamp, uint80 _answeredInRound) {
    _roundID = 36893488147419118515;
    _price = 458505915949;
    _startedAt = 1638293561;
    _timeStamp = 1638293561;
    _answeredInRound = 36893488147419118515;
    return (_roundID, _price, _startedAt, _timeStamp, _answeredInRound);
  }

  function getLatestPrice() public view returns (uint80 _roundID, int _price, uint _startedAt, uint _timeStamp, uint80 _answeredInRound) {
    (
      uint80 roundID, 
      int price,
      uint startedAt,
      uint timeStamp,
      uint80 answeredInRound
    ) = priceFeed.latestRoundData();
    _roundID = roundID;
    _price = price;
    _startedAt = startedAt;
    _timeStamp = timeStamp;
    _answeredInRound = answeredInRound;
    return (_roundID, _price, _startedAt, _timeStamp, _answeredInRound);
  }
}
