# blockchain-developer-bootcamp-final-project

## Prenditas - Second hand kid's clothes

This project is a proof on concept of a little exchange where users can sell or buy second hand kid's clothes as
their tend to be used rarely.

### Solution overview

- Let users connect with their metamask wallet
- Users can list a new piece of clothing on the site
- Sellers specify their clothing attributes before listing
- Potential buyers can bargain the clothing price (only implemented on the contract and the contract tests)

- A transaction is complete when one of this two conditions are met:
  - Buyer and seller agree on a new price (to do)
  - Buyer pays listed price

- Seller marks clothes as shipped
- Buyer confirms clothes as received (to do)

---

### Project structure

The project follows the convention that truffle enforces throught the **truffle create commands** which is
the following:

- **contracts**
The solidity contracts
- **build**
The ABI json build of each contract
- **client**
The react project
- **migrations**
The migration scripts for each solidity contract
- **node_modules**
Solidity libs
- **test**
Solidity contract unit tests

**truffle-config.js**
Truffle configuration that specifies the networks to migrate the contract, the
wallet to use (in case of deploying to a testnet) and the compiler version.

---

#### Pre-requisites

- Latest version of nodejs and npm (older versions like 10 and afterwards should work)
(nodejs)[https://nodejs.org/en/]

- Truffle
`npm install -g truffle`

- Ganache cli (to run the test or testing locally)
`npm install -g ganache-cli`

---

#### Installation

Install dependencies at root directory

`npm install`

##### Contract

To compile the contracts run

`truffle compile`

---

##### Tests

To run the tests:

On another terminal run:

`ganache-cli`

On another terminal run:

`truffle test`

There should be 8 tests passing

---

#### Running the frontend

To run the application go to:

`cd client`

and do

`npm start`

Visit http://localhost:3000
