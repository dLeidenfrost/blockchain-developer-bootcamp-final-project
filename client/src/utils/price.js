export const getUSDPrice = (eth, ethInUSD) => {
  return Number(eth) > 0 ? Number(eth) * ethInUSD : 0;
};
