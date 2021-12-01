import "bootstrap/dist/css/bootstrap.min.css";
import "./theme/override.css";
import React, { useState, useReducer } from "react";
import ClothingExchangeContract from "./contracts/ClothingExchange.json";
import { useMountEffect } from "./hooks/mount";
import getWeb3 from "./getWeb3";
import Home from "./pages/Home";
import { initialState, reducer, setEthUsd } from "./reducer/clothing";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import {ROUTES} from "./constants";
import Orders from "./pages/Orders";

export const AppContext = React.createContext(null);

const App = () => {
  const [accounts, setAccounts] = useState();
  const [contract, setContract] = useState();
  const [web3, setWeb3] = useState();
  const [state, dispatch] = useReducer(reducer, initialState);

  const hasAccounts = accounts && accounts.length > 0;
  const hasWeb3 = web3 != null;
  const hasContractInstance = contract != null;
  const loading = !hasContractInstance || !hasWeb3 || !hasAccounts;

  useMountEffect(() => {
    const load = async () => {
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = ClothingExchangeContract.networks[networkId];
      const instance = new web3.eth.Contract(
        ClothingExchangeContract.abi,
        deployedNetwork && deployedNetwork.address
      );
      setWeb3(web3);
      setAccounts(accounts);
      setContract(instance);
      const response = await instance.methods.mockGetLatestPrice().call();
      // Set the current eth/usd data feed price
      if (response && response._price) {
        const BN = web3.utils.BN;
        const price = new BN(response._price)
          .divRound(new BN(Math.pow(10, 8)))
          .toNumber();
        dispatch(setEthUsd(price));
      }
    };
    load();
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AppContext.Provider value={{ accounts, contract, web3, state, dispatch }}>
      <Router>
        <Routes>
          <Route path={ROUTES.ORDERS} element={<Orders />} />
          <Route path={ROUTES.HOME} element={<Home />} />
        </Routes>
      </Router>
    </AppContext.Provider>
  );
};

export default App;
