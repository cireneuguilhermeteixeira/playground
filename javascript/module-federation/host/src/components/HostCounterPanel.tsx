import React from "react";
import { useStore } from "zustand";
import { zustandCounterStore } from "../state/zustandCounterStore";

const HostCounterPanel: React.FC = () => {
  const count = useStore(zustandCounterStore, (s) => s.count);
  const inc   = useStore(zustandCounterStore, (s) => s.inc);
  const dec   = useStore(zustandCounterStore, (s) => s.dec);
  const reset = useStore(zustandCounterStore, (s) => s.reset);

  return (
    <div style={{ marginTop: 16 }}>
      <h4>Host Counter Panel</h4>
      <p>Count: {count}</p>
      <button onClick={() => inc()}>+1</button>{" "}
      <button onClick={() => dec()}>-1</button>{" "}
      <button onClick={() => inc(5)}>+5</button>{" "}
      <button onClick={reset}>Reset</button>
    </div>
  );
};

export default HostCounterPanel;
