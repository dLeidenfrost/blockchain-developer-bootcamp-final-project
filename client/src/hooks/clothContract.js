import { useContext, useEffect, useState } from "react";
import { AppContext } from "../App";
import { getClothAttrs } from "../utils/clothing";

export const useGetClothing = () => {
  const [data, setData] = useState([]);
  const { contract, state } = useContext(AppContext);

  useEffect(() => {
    if (state.listEvent == null) return;
    const load = async () => {
      const clothes = [];
      console.log("fetch again:", state.boughtEvent);
      const clothingCounter = await contract.methods.clothingCounter().call();
      if (clothingCounter > 0) {
        // Show the last one added first
        for (let i = clothingCounter - 1; i >= 0; i--) {
          const cloth = await contract.methods.clothing(i).call();
          const c = getClothAttrs(cloth);
          clothes.push(c);
        }
        setData(clothes);
      }
    };
    load();
  }, [state.listEvent, state.boughtEvent, contract.methods]);
  return data;
};
