const ClothingExchange = artifacts.require("ClothingExchange");
let BN = web3.utils.BN;
/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("ClothingExchange", function (accounts) {
  const [contractOwner, seller, buyer1, buyer2] = accounts;
  const emptyAddress = "0x0000000000000000000000000000000000000000";
  const buyer1SuggestedPrice = "2000000000000000000";
  const buyer2SuggestedPrice = "4000000000000000000";

  const name = "Blue long sleeves tshirt";
  const initialPrice = "10000";
  const description = "Curabitur volutpat venenatis ante, ut porta erat.";
  const brand = "Brand1";
  const recommendedAge = "2-4 years";
  const size = ClothingExchange.Sizes.LARGE;

  const name1 = "Yellow pants";
  const initialPrice1 = "1000000000000000000";
  const description1 =
    "Aliquam orci lorem, rutrum eget felis ac, tincidunt tempus tortor. Vestibulum lorem justo, dapibus";
  const brand1 = "Brand1";
  const recommendedAge1 = "2-4 years";
  const size1 = ClothingExchange.Sizes.MEDIUM;

  it("Can create a new contract instance", async () => {
    await ClothingExchange.deployed(contractOwner);
    return assert.isTrue(true);
  });

  it("Can can get latest price of ETH in USD", async () => {
    const instance = await ClothingExchange.deployed(contractOwner);
    const data = await instance.mockGetLatestPrice();
    return assert.equal(
      new BN(data[1]).toString(),
      "458505915949",
      "Mocked USD price is correct"
    );
  });

  describe("Use cases", () => {
    it("Can list a piece of clothing", async () => {
      const instance = await ClothingExchange.deployed(contractOwner);
      await instance.listClothingOnSell(
        name,
        initialPrice,
        description,
        brand,
        recommendedAge,
        size,
        { from: seller }
      );
      await instance.listClothingOnSell(
        name1,
        initialPrice1,
        description1,
        brand1,
        recommendedAge1,
        size1,
        { from: seller }
      );
      const addedClothing = await instance.getClothingById.call(0);
      assert.equal(
        addedClothing[0],
        name,
        "Clothing name is the same as the one listed"
      );
      assert.equal(
        addedClothing[1],
        brand,
        "Brand name is the same as the one listed"
      );
      assert.equal(
        addedClothing[2],
        description,
        "Brand name is the same as the one listed"
      );
      assert.equal(
        addedClothing[3],
        recommendedAge,
        "Recommended age is the same as the one listed"
      );
      assert.equal(
        addedClothing[4],
        initialPrice,
        "Initial price is the same as the one listed"
      );
      assert.equal(
        addedClothing[5],
        size,
        "Size is the same as the one listed"
      );
      assert.equal(
        addedClothing[6],
        seller,
        "Address of the person listing the clothing to sell"
      );
      assert.equal(
        addedClothing[7],
        emptyAddress,
        "Buyer address should be empty"
      );
      assert.equal(
        addedClothing[8],
        ClothingExchange.State.LISTED,
        "Clothing should be created with a 'Listed' status"
      );
    });

    it("Can bargain clothing price as a potential buyer", async () => {
      const instance = await ClothingExchange.deployed(contractOwner);
      await instance.bargainClothingPrice(0, {
        from: buyer1,
        value: buyer1SuggestedPrice,
      });
      const newPrice = await instance.getClothingTempPrice.call(0, buyer1);
      assert.equal(
        newPrice,
        buyer1SuggestedPrice,
        "Potential buyer suggested price is saved on the clothing mapping"
      );
    });

    it("Seller can confirm an offer from a potential buyer", async () => {
      const sellerBefore = await web3.eth.getBalance(seller);
      const buyer1Before = await web3.eth.getBalance(buyer1);
      const buyer2Before = await web3.eth.getBalance(buyer2);
      const instance = await ClothingExchange.deployed(contractOwner);
      await instance.bargainClothingPrice(0, {
        from: buyer2,
        value: buyer2SuggestedPrice,
      });
      await instance.confirmNewClothingPrice(0, buyer2, { from: seller });
      const sellerAfter = await web3.eth.getBalance(seller);
      const buyer1After = await web3.eth.getBalance(buyer1);
      const buyer2After = await web3.eth.getBalance(buyer2);

      const cloth = await instance.getClothingById.call(0);
      assert.equal(
        cloth[7],
        buyer2,
        "Seller confirmed buyer 2 suggested price"
      );
      assert.equal(
        cloth[8],
        ClothingExchange.State.SOLD,
        "Listed clothing now has a SOLD state"
      );
      assert.equal(
        cloth[9],
        buyer2SuggestedPrice,
        "Agreed price is the same as buyer's2 suggested price"
      );
      // Seller balance is increased by new agreed price - gas cost to confirm the transaction
      assert.isAbove(
        Number(new BN(sellerAfter)),
        Number(new BN(sellerBefore)),
        "Seller's balance should be increased by the suggested price of buyer2 (ignoring gas cost)"
      );
      // Confirm and withdraw address that won the bargain
      assert.isBelow(
        Number(new BN(buyer2After)),
        Number(new BN(buyer2Before).sub(new BN(buyer2SuggestedPrice))),
        "Buyers2's balance should be reduced by more of the suggested price (gas costs)"
      );
      // Refund failed address to bargain a price
      assert.equal(
        new BN(buyer1After).toString(),
        new BN(buyer1Before).add(new BN(buyer1SuggestedPrice)).toString(),
        "Buyers1's balance should be refunded on failing to gain the auction"
      );
    });

    it("Potential buyer can buy through listed price directly", async () => {
      const instance = await ClothingExchange.deployed(contractOwner);
      const sellerBefore = await web3.eth.getBalance(seller);
      const buyer1Before = await web3.eth.getBalance(buyer1);
      await instance.buyClothingOnSell(1, {
        from: buyer1,
        value: Number(new BN(initialPrice1)) * 2,
      });
      const sellerAfter = await web3.eth.getBalance(seller);
      const buyer1After = await web3.eth.getBalance(buyer1);
      const cloth = await instance.getClothingById.call(1);
      assert.equal(cloth[7], buyer1, "Buyer address is buyer1's address");
      assert.equal(
        cloth[8],
        ClothingExchange.State.SOLD,
        "Listed clothing now has a SOLD state"
      );
      assert.equal(
        new BN(sellerAfter).toString(),
        new BN(sellerBefore).add(new BN(initialPrice1)).toString(),
        "Seller's balance should be increased by the initial price of the cloth"
      );
      assert.isBelow(
        Number(new BN(buyer1After)),
        Number(new BN(buyer1Before).sub(new BN(initialPrice1))),
        "Buyers balance should be reduced by clothing price plus gas costs"
      );
    });

    it("Seller can mark piece of clothing as shipped", async function () {
      const trackingNumber1 = "975983745897";
      const trackingNumber2 = "209347589475";
      const instance = await ClothingExchange.deployed(contractOwner);
      // Seller ships both items
      await instance.shipClothing(0, trackingNumber1, { from: seller });
      await instance.shipClothing(1, trackingNumber2, { from: seller });
      const cloth1 = await instance.getClothingById.call(0);
      const cloth2 = await instance.getClothingById.call(1);
      const clothTrackingNumber1 = await instance.getTrackingNumber.call(0);
      const clothTrackingNumber2 = await instance.getTrackingNumber.call(1);
      assert.equal(
        clothTrackingNumber1,
        trackingNumber1,
        `${name} has a tracking number`
      );
      assert.equal(
        clothTrackingNumber2,
        trackingNumber2,
        `${name1} has a tracking number`
      );
      assert.equal(
        cloth1.state,
        ClothingExchange.State.SHIPPED,
        `${name} was marked as shipped`
      );
      assert.equal(
        cloth2.state,
        ClothingExchange.State.SHIPPED,
        `${name1} was marked as shipped`
      );
    });

    it("Buyer can mark piece of clothing as received", async function () {
      const instance = await ClothingExchange.deployed(contractOwner);
      // Buyer 2 that won the bargain marks clothing as received
      await instance.receiveClothing(0, { from: buyer2 });
      // Buyer 1 that payed the listed price marks clothing as received
      await instance.receiveClothing(1, { from: buyer1 });
      const cloth1 = await instance.getClothingById.call(0);
      const cloth2 = await instance.getClothingById.call(1);
      assert.equal(
        cloth1.state,
        ClothingExchange.State.RECEIVED,
        `${name} was marked as received`
      );
      assert.equal(
        cloth2.state,
        ClothingExchange.State.RECEIVED,
        `${name1} was marked as received`
      );
    });
  });
});
