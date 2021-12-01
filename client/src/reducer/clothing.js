export const initialState = {
  listEvent: 0,
  boughtEvent: 0,
  shippedEvent: 0,
  ethInUSD: 0,
};
const LOG_LIST_EVENT = "LOG_LIST_EVENT";
const LOG_BOUGHT_EVENT = "LOG_BOUGHT_EVENT";
const LOG_SHIPPED_EVENT = "LOG_SHIPPED_EVENT";
const SET_ETH_USD = "SET_ETH_USD";

export const reducer = (state, action) => {
  switch (action.type) {
    case LOG_LIST_EVENT:
      return { ...state, listEvent: action.value };
    case LOG_BOUGHT_EVENT:
      return { ...state, boughtEvent: action.value };
    case LOG_SHIPPED_EVENT:
      return { ...state, shippedEvent: action.value };
    case SET_ETH_USD:
      return { ...state, ethInUSD: action.value };
    default:
      return state;
  }
};

export const setLogListEvent = (listEvent) => {
  return { type: LOG_LIST_EVENT, value: listEvent };
};

export const setLogBought = (boughtEvent) => {
  return { type: LOG_LIST_EVENT, value: boughtEvent };
};

export const setShippedEvent = (shippedEvent) => {
  return { type: LOG_SHIPPED_EVENT, value: shippedEvent };
};

export const setEthUsd = (usd) => {
  return { type: SET_ETH_USD, value: usd };
};
