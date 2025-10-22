import React from "react";
import { useStore } from "zustand";
import { counterStore } from "../state/counterStore";

const HostCounterPanel: React.FC = () => {
  const count = useStore(counterStore, (s) => s.count);
  const inc   = useStore(counterStore, (s) => s.inc);
  const dec   = useStore(counterStore, (s) => s.dec);
  const reset = useStore(counterStore, (s) => s.reset);

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
