import React, { useSyncExternalStore } from "react";
import { counterStore, subscribe, getSnapshot } from "../state/pureCounterStore";

const HostPureCounterPanel: React.FC = () => {
  const count = useSyncExternalStore(subscribe, getSnapshot);

  return (
    <div style={{ marginTop: 16 }}>
      <h4>Host Pure Counter</h4>
      <p>Count: {count}</p>
      <button onClick={() => counterStore.inc()}>+1</button>{" "}
      <button onClick={() => counterStore.dec()}>-1</button>{" "}
      <button onClick={() => counterStore.inc(5)}>+5</button>{" "}
      <button onClick={() => counterStore.reset()}>Reset</button>
    </div>
  );
};

export default HostPureCounterPanel;
