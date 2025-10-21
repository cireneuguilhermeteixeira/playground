import { CounterState } from "host/store";
import React from "react";

const useCounterStorePromise = () => import("host/store").then(m => m.useCounterStore);

const SharedStateDemo: React.FC = () => {
  const [useCounterStore, setHook] = React.useState<null | (() => CounterState)>(null);
//   const [useCounterStore, setHook] = React.useState<null | ReturnType<typeof useCounterStorePromise>>(null);

  React.useEffect(() => {
    let mounted = true;
    useCounterStorePromise().then((hook) => mounted && setHook(hook));
    return () => { mounted = false; };
  }, []);

  if (!useCounterStore) return <p>Loading shared store…</p>;

  const { count, inc, dec, reset } = useCounterStore();

  return (
    <div style={{ marginTop: 16 }}>
      <h4>Remote1 Shared State Demo</h4>
      <p>Count (from host store): {count}</p>
      <button onClick={() => inc()}>+1</button>{" "}
      <button onClick={() => dec()}>-1</button>{" "}
      <button onClick={() => inc(5)}>+5</button>{" "}
      <button onClick={reset}>Reset</button>
    </div>
  );
};

export default SharedStateDemo;
