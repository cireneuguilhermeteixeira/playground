import React from "react";
import { useCounterStore } from "./../state/counterStore";

const HostCounterPanel: React.FC = () => {
  const { count, inc, dec, reset } = useCounterStore();
  return (
    <div style={{ marginTop: 16 }}>
      <h4>Host Counter Panel</h4>
      <p>Count: {count}</p>
      <button onClick={() => inc()}>+1</button>{" "}
      <button onClick={() => dec()}>-1</button>{" "}
      <button onClick={reset}>Reset</button>
    </div>
  );
};

export default HostCounterPanel;
