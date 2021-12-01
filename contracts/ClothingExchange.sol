// SPDX-License-Identifier: MIT
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

pragma solidity 0.8.10;

/// @title Kid's clothing exchange
/// @author Daniel Martinez
/// @notice This contract is a proof of concept
/// @custom:experimental This is an experimental contract.
contract ClothingExchange is AccessControl {

  AggregatorV3Interface internal priceFeed;

  /// @dev Open zeppelin role definition
  bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

  /// @dev All the states of an order (a cloth)
  enum State {
    EMPTY,
    LISTED,
    SOLD,
    SHIPPED,
    RECEIVED
  }

  /// @dev All the sizes of a cloth
  enum Sizes {
    SMALL,
    MEDIUM,
    LARGE,
    XLARGE
  }

  /// @dev The number of added clothes to the mapping
  uint public clothingCounter;

  /// @dev Limit the number of buyers that can bargain a garment
  uint public constant BARGAIN_ADDRESS_LIMIT = 5;

  /// @dev The clothing struct that defines all the properties of the cloth
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

  /// @dev A tracking numbers mapping to associate a tracking number to a cloth
  mapping (uint => string) public trackingNumbers;

  /// @dev Clothing mapping that handles all the clothes
  mapping (uint => Cloth) public clothing;

  /// @notice Validates that the sender is the owner
  modifier isOwner () {
    require (hasRole(ADMIN_ROLE, msg.sender), "Is not owner");
    _;
  }

  /// @notice Validates the price to be greater than zero
  /// @param _price The cloth price
  modifier validPrice (uint _price) {
    require (_price > 0, "Price must be greater than 0");
    _;
  }

  /// @notice Validates the listed state
  /// @param clothId The cloth id
  modifier isListed (uint clothId) {
    require (clothing[clothId].state == State.LISTED);
    _;
  }

  /// @notice Validates the limit of addresses that can make a new offer
  /// @param tempPriceAddresses Array of address that can make an offer
  modifier canBargain (address[] memory tempPriceAddresses) {
    require (tempPriceAddresses.length <= BARGAIN_ADDRESS_LIMIT);
    _;
  } 

  /// @notice Validates the sold state
  /// @param clothId The cloth id
  modifier isSold (uint clothId) {
    require (clothing[clothId].state == State.SOLD);
    _;
  }

  /// @notice Validates the shipped state
  /// @param clothId The cloth id
  modifier isShipped (uint clothId) {
    require (clothing[clothId].state == State.SHIPPED);
    _;
  }

  /// @notice Validates that the defined address made the function call
  modifier verifyCaller (address caller) {
    require (msg.sender == caller);
    _;
  }

  /// @notice Validates that the payment was the same as the price
  /// @param price The cloth price
  modifier paidEnough (uint price) {
    require (msg.value >= price);
    _;
  }

  /// @notice Refunds if the payment was greater than the price
  /// @param price The cloth price
  modifier verifyExcessAmount (uint price) {
    _;
    uint refundValue = msg.value - price;
    if (refundValue > 0) {
      (bool _sent,) = msg.sender.call{value: refundValue}("");
      require(_sent);
    }
  }

  /// @notice LogEvent that triggers when a clothing was listed for sale
  /// @param seller The address of the seller
  /// @param clothCounter The counter of the clothes added
  event LogListClothingForSale (address seller, uint indexed clothCounter);

  /// @notice LogEvent that triggers when a new offer was made for a piece of clothing
  /// @param clothId The cloth id
  /// @param newPrice The offered price
  event LogAddedBargain (address buyer, uint indexed clothId, uint newPrice);

  /// @notice LogEvent that triggers an offer has been confirmed
  /// @param buyer The address of the buyer
  /// @param clothId The cloth id
  /// @param confirmedPrice The confirmedPrice
  event LogConfirmedNewPrice (address buyer, uint indexed clothId, uint confirmedPrice);

  /// @notice LogEvent that triggers when a cloth has been bought
  /// @param buyer The address of the buyer
  /// @param clothId The cloth id
  event LogClothingBought (address buyer, uint indexed clothId);

  /// @notice LogEvent that triggers when a cloth has been shipped
  /// @param seller The address of the seller
  /// @param clothId The cloth id
  /// @param trackingNumber The tracking number of the shipment service
  event LogClothShipped (address seller, uint indexed clothId, string trackingNumber);

  /// @notice LogEvent that triggers when a cloth has been received
  /// @param buyer The address of the buyer
  /// @param clothId The cloth id
  event LogClothReceived (address buyer, uint indexed clothId);

  /// @notice LogEvent that triggers when the owner calls a function
  /// @param owner The address of the owner
  event LogOwnerCall (address owner);

  /// @dev Open zeppelin setup role for the contract owner, initialization of the chainlink data feed agregator
  constructor () {
    _setupRole(ADMIN_ROLE, msg.sender);
    // Rinkeby data feed address 0x8A753747A1Fa494EC906cE90E9f37563A8AF630e
    priceFeed = AggregatorV3Interface(0x8A753747A1Fa494EC906cE90E9f37563A8AF630e);
  }

  /// @notice It validates that the initial price is greater than zero
  /// @param _name Title of the kid's cloth to sell
  /// @param _initialPrice The initial price of the cloth
  /// @param _description A little description of the condition of the clothing
  /// @param _brand The cloth's brand
  /// @param _recommendedAge The recommended age for this piece of clothing
  /// @param _size The size of the cloth
  /// @return The cloth counter
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

  /// @dev There is a validation to limit the number of addresses for tempPriceAddresses
  /// @param clothId The cloth id for the mapping
  /// @param buyer The address of the potential buyer
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

  /// @notice It validates a LISTED state, price > 0 and that the address can make an offer (the address is not seller)
  /// @param clothId The cloth id for the mapping
  /// @return True if no errors were thrown
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

  /// @notice It validates the caller of the function is the seller, price > 0 and the state is LISTED
  /// @param clothId The cloth id for the mapping
  /// @param potentialBuyer The address of the potential buyer
  /// @return True if no errors were thrown
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

  /// @notice It validates the payed amount is valid, the item is LISTED and if the amount payed is more than the price, a refund process is executed
  /// @param clothId The cloth id for the mapping
  /// @return True if no errors were thrown
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

  /// @notice It validates the caller of the function (must be the seller) and that the cloth is Sold
  /// @param clothId The cloth id for the mapping
  /// @param trackingNumber The tracking number of the shipment service
  function shipClothing (uint clothId, string memory trackingNumber) verifyCaller(clothing[clothId].seller) isSold(clothId) public {
    Cloth storage c = clothing[clothId];
    c.state = State.SHIPPED;
    trackingNumbers[c.clothId] = trackingNumber;
    emit LogClothShipped(c.seller, clothId, trackingNumber);
  }

  /// @notice It validates the caller (must be the buyer) and the cloth state (must be shipped)
  /// @param clothId The cloth id for the mapping
  function receiveClothing (uint clothId) verifyCaller(clothing[clothId].buyer) isShipped(clothId) public {
    Cloth storage c = clothing[clothId];
    c.state = State.RECEIVED;
    emit LogClothReceived(c.buyer, clothId);
  }

  /// @param clothId The cloth id for the mapping
  /// @return name Cloth name
  /// @return brand Cloth brand
  /// @return description Condition of the clothing
  /// @return recommendedAge Recommended age for the clothing
  /// @return initialPrice The initial listed price of the clothing
  /// @return size The cloth size
  /// @return seller The address of the seller that listed this cloth
  /// @return buyer The address of the buyer of this cloth
  /// @return state The status of the order
  /// @return agreedPrice The accepted offer by the seller
  /// @return tempPriceAddresses The addresses that made an offer to the clothes
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

  /// @param clothId The cloth id for the mapping
  /// @param buyer The address of the buyer
  /// @return suggestedPrice The offer made by the buyer
  function getClothingTempPrice (uint clothId, address buyer) public view returns (uint suggestedPrice) {
    suggestedPrice = clothing[clothId].tempPrice[buyer];
  }

  /// @param clothId The cloth id for the mapping
  /// @return trackingNumber The trackin number for this order (if any)
  function getTrackingNumber (uint clothId) public view returns (string memory) {
    return trackingNumbers[clothId];
  }

  /// @dev A mock function that emulates the behavior of the chainlink data feed to get the usd price of eth
  /// @return _roundID Data feed roundid
  /// @return _price The usd price of eth
  /// @return _startedAt Data feed started at
  /// @return _timeStamp Data feed timestamp
  /// @return _answeredInRound Data feed answeredInRound
  function mockGetLatestPrice () public pure returns (uint80 _roundID, int _price, uint _startedAt, uint _timeStamp, uint80 _answeredInRound) {
    _roundID = 36893488147419118515;
    _price = 458505915949;
    _startedAt = 1638293561;
    _timeStamp = 1638293561;
    _answeredInRound = 36893488147419118515;
    return (_roundID, _price, _startedAt, _timeStamp, _answeredInRound);
  }

  /// @dev Chainlink data price call on Rinkeby tesnet
  /// @return _roundID Data feed roundid
  /// @return _price The usd price of eth
  /// @return _startedAt Data feed started at
  /// @return _timeStamp Data feed timestamp
  /// @return _answeredInRound Data feed answeredInRound
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
