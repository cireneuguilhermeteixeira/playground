// remote1/src/components/SharedStateDemo.tsx
import React from "react";
import { useStore } from "zustand";
import type { CounterState } from "host/zustandStore";

type StoreApi<T> = import("zustand/vanilla").StoreApi<T>;

const SharedStatePanel: React.FC<{ store: StoreApi<CounterState> }> = ({ store }) => {
  const count = useStore(store, (s) => s.count);
  const inc   = useStore(store, (s) => s.inc);
  const dec   = useStore(store, (s) => s.dec);
  const reset = useStore(store, (s) => s.reset);

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

const SharedStateDemo: React.FC = () => {
  const [store, setStore] = React.useState<StoreApi<CounterState> | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let alive = true;
    import("host/zustandStore")
      .then((m) => {
        if (!alive) return;
        if (!m?.zustandCounterStore) {
          setError("zustandCounterStore not found in host/zustandStore");
          return;
        }
        setStore(m.zustandCounterStore);
      })
      .catch((e) => {
        console.error("[SharedStateDemo] failed to load host/zustandStore:", e);
        if (alive) setError(String(e));
      });
    return () => { alive = false; };
  }, []);

  if (error) {
    return <pre style={{ color: "#b91c1c" }}>Failed to load shared store: {error}</pre>;
  }

  // Enquanto não há store, NENHUM hook é chamado (no pai). O filho só monta depois.
  if (!store) return <p>Loading shared store…</p>;

  return <SharedStatePanel store={store} />;
};

export default SharedStateDemo;
