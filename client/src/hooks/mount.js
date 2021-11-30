import { useEffect } from "react";

export const useMountEffect = fun => useEffect(fun, []); // eslint-disable-line react-hooks/exhaustive-deps
