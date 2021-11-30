export const initialState = { listEvent: 0, boughtEvent: 0 };
const LOG_LIST_EVENT = "LOG_LIST_EVENT";
const LOG_BOUGHT_EVENT = "LOG_BOUGHT_EVENT";

export const reducer = (state, action) => {
  switch (action.type) {
    case LOG_LIST_EVENT:
      return { listEvent: action.value };
    case LOG_BOUGHT_EVENT:
      return { boughtEvent: action.value };
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
