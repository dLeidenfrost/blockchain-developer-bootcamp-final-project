// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract ClothingExchange {

  enum State {
    LISTED,
    SOLD,
    SHIPPED,
    RECEIVED
  }

  uint clothingCounter;

  struct Cloth {
    uint clothId;
    string name;
    uint initialPrice;
    string description;
    string brand;
    string size;
    string recommendedAge;
    address seller;
    address buyer;
    uint bargainAddressesLimit; // Limit the number of buyers that can bargain a garment
    mapping (address => uint) tempPrice;
  }

  mapping (uint => Cloth) clothing;

  modifier canBargain (uint bargainAddressesLimit, address buyer) {} 
  modifier isSold (uint garmentId) {}
  modifier isShipped (uint garmentId) {}
  modifier verifyCaller (address caller) {}

  function listClothingOnSell (address seller, uint256 initialPrice) {}
  function buyClothingOnSell (address buyer) {}
  function bargainClothingPrice (address buyer, uint256 newPrice) {}
  function confirmNewClothingPrice (address seller, address buyer, uint256 confirmedPrice) {}
  function shipClothing (address seller, uint256 clothId) {}
  function clothingReceived (address buyer, uint256 clothId) {}

}
