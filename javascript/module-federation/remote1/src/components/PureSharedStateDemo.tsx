import React, { useEffect, useState, useSyncExternalStore } from "react";

type CounterAPI = typeof import("host/pureStore");

const Panel: React.FC<{ api: CounterAPI }> = ({ api }) => {
  const count = useSyncExternalStore(api.subscribe, api.getSnapshot);
  return (
    <div style={{ marginTop: 16 }}>
      <h4>Remote1 Pure Shared State</h4>
      <p>Count (from host): {count}</p>
      <button onClick={() => api.counterStore.inc()}>+1</button>{" "}
      <button onClick={() => api.counterStore.dec()}>-1</button>{" "}
      <button onClick={() => api.counterStore.inc(5)}>+5</button>{" "}
      <button onClick={() => api.counterStore.reset()}>Reset</button>
    </div>
  );
};

const PureSharedStateDemo: React.FC = () => {
  const [api, setApi] = useState<null | CounterAPI>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    import("host/pureStore")
      .then((m) => {
        if (!alive) return;
        if (!m?.counterStore) {
          setErr("counterStore not found in host/pureStore");
          return;
        }
        setApi(m);
      })
      .catch((e) => {
        console.error("[PureSharedStateDemo] failed to load host/pureStore:", e);
        if (alive) setErr(String(e));
      });
    return () => { alive = false; };
  }, []);

  if (err) return <pre style={{ color: "#b91c1c" }}>{err}</pre>;
  if (!api) return <p>Loading shared store…</p>;

  return <Panel api={api} />;
};

export default PureSharedStateDemo;
