# blockchain-developer-bootcamp-final-project

## Prenditas - Second hand kid's clothes

This project is a proof of concept of a little exchange where users can sell or buy second hand kid's clothes.

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

### Pre-requisites

- Latest version of nodejs and npm (older versions like 10 and afterwards should work)
(nodejs)[https://nodejs.org/en/]

- Truffle
`npm install -g truffle`

- Ganache cli (to run the test or testing locally)
`npm install -g ganache-cli`

---

### Installation

Install dependencies at root directory

`npm install`

### Contract

To compile the contracts run

`truffle compile`

---

### Tests

To run the tests:

On another terminal run:

`ganache-cli`

On another terminal run:

`truffle test`

There should be 8 tests passing

**Note:** The local port to test locally is the default **8545**

---

#### Running the frontend

To run the application go to:

`npm run app`

Visit http://localhost:3000

Currently the contract is deployed on the **Rinkeby testnet**

The contract address is: `0x7964E08E892a654661DCDf20d01dAb78FF659A12`

The app is now available on:

https://blockchain-developer-bootcamp-fin-dnlmartinezfernandez-gmailcom.vercel.app/

### Deploying the contract on Rinkeby testnet

If you want to deploy the contract on rinkeby you'll need to add a
`.secret` file with your mnemonic linked to your metamask wallet

The wallet has to have some ether on it

To request some eth try the following faucets:

https://faucets.chain.link/rinkeby

### Recording walkthrough
https://www.loom.com/share/a5193216cd6a4f61af60b04506d776fc

### My eth account:
0x5d553008A67299507fDDb989d559578A051f2AA2

