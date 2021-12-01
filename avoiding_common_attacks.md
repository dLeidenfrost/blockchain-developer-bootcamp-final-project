# Avoiding common attacks

The app took note of the following common pitfalls and attacks:

- Currently using a specific compiler pragma **0.8.10**

- **Proper use of require, assert and revert:** The app only uses the require statement
to handle validations.

- **Use modifiers only validation:** All modifiers except one are only used to
validate states, amounts or callers, but one modifier refunds balance if the
user for whatever reason sends more ether than expected.

- **Checks-Effects-Interactions and Reentrancy:** All the transfers to the seller and the buyer accounts are done
after a state change on the cloth struct, another call to this functions are not going to be processed
because the item has a new state that is validated by a modifier.

E.g. 

```
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
```

Another call on buyClothingOnSell is going to fail because the cloth struct now has a SOLD state
which is different from the expected LISTED state for this function.

- **There is no timestamp dependence**
