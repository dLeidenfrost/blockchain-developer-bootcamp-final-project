# Design Patterns Decisions

This app only takes advantage of 2 design patterns studied on the course (and 1 that is implemented but it's never used on the frontend app)

- **Oracles:**
  The app uses chainlink data feeds to get the latest rounded price of ether
  through the rinkeby tesnet so the users can view an aproximation of the usd
  price when buying and selling.
  (Get latest price)[https://docs.chain.link/docs/get-the-latest-price/]
  Rinkeby address: 0x8A753747A1Fa494EC906cE90E9f37563A8AF630e

- **Access Control Design Patterns:**
  Even tho the app lets users to be buyers and sellers, there is a restriction in who can
  change some states of a cloth. The app takes the approach seen on the supply chain exercise
  where there is a *verify caller* modifier that validates who can call certain functions.
  There is also an *isOwner* modifier that uses openzeppelin roles, but this function is not
  really used by the app.

- **Inheritance and Interfaces:**
  As pointed out in the last statement there is an implementation of the openzeppelin *Roles* library
  that enhances the contract with control lists. The implementation does inheritance and so it can setup
  roles, but at the moment the app doesn't take much advantage of it.

**Future improvements**

As developement of the contract went I notice posible improvements by embracing some of the other
design patterns shown on the bootcamp:

- The app feels like it can be more modular, there are 2 features (an auction process, a shipment tracking) that can be translated to
another contract, expanding their capabilites and making the app more resilient.

- The optimization of gas is really bad, there is no optimization at all, the greatest issue
I noticed is in the struct definition. To many properties, and the description attribute probably
is a little bit of an overkill :S.

- There is no mechanism to upgrade this contract.
