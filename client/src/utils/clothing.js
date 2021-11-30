export const getClothAttrs = (cloth) => {
  const {
    name,
    brand,
    buyer,
    agreedPrice,
    clothId,
    description,
    initialPrice,
    recommendedAge,
    seller,
    state,
    tempPriceCounter,
  } = cloth;
  return {
    name,
    brand,
    buyer,
    agreedPrice,
    clothId,
    description,
    initialPrice,
    recommendedAge,
    seller,
    state,
    tempPriceCounter,
  };
};
