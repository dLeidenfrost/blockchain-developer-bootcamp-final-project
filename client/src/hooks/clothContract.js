import { useContext, useEffect, useState } from "react";
import { AppContext } from "../App";
import { getClothAttrs } from "../utils/clothing";
import { State } from "../constants";

export const useGetClothing = () => {
  const [data, setData] = useState([]);
  const { contract, state } = useContext(AppContext);

  useEffect(() => {
    if (state.listEvent == null) return;
    const load = async () => {
      const clothes = [];
      const clothingCounter = await contract.methods.clothingCounter().call();
      if (clothingCounter > 0) {
        // Show the last one added first
        for (let i = clothingCounter - 1; i >= 0; i--) {
          const cloth = await contract.methods.clothing(i).call();
          const c = getClothAttrs(cloth);
          if (
            c.state === State.LISTED.toString() ||
            c.state === State.SOLD.toString()
          ) {
            clothes.push(c);
          }
        }
        setData(clothes);
      }
    };
    load();
  }, [state.listEvent, state.boughtEvent, contract.methods]);
  return data;
};

export const useGetMyOrders = () => {
  const [listedOrders, setListedOrders] = useState([]);
  const [soldOrders, setSoldOrders] = useState([]);
  const [boughtOrders, setBoughtOrders] = useState([]);
  const { contract, accounts, state } = useContext(AppContext);
  useEffect(() => {
    const load = async () => {
      const _soldOrders = [];
      const _listedOrders = [];
      const _boughtOrders = [];
      const clothingCounter = await contract.methods.clothingCounter().call();
      if (clothingCounter > 0) {
        // Show the last one added first
        for (let i = clothingCounter - 1; i >= 0; i--) {
          const cloth = await contract.methods.clothing(i).call();
          const trackingNumber = await contract.methods
            .trackingNumbers(i)
            .call();
          const c = getClothAttrs(cloth);
          c.trackingNumber = trackingNumber || "";
          if (c.buyer === accounts[0]) {
            _boughtOrders.push(c);
          }
          if (c.seller === accounts[0]) {
            if (c.state === State.LISTED.toString()) {
              _listedOrders.push(c);
            } else if (
              c.state === State.SOLD.toString() ||
              c.state === State.SHIPPED.toString()
            ) {
              _soldOrders.push(c);
            }
          }
        }
        setListedOrders(_listedOrders);
        setSoldOrders(_soldOrders);
        setBoughtOrders(_boughtOrders);
      }
    };
    load();
  }, [state.shippedEvent, accounts, contract.methods]);
  return { soldOrders, listedOrders, boughtOrders };
};
