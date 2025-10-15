import React from "react";

// consumidores do remoto (tipos virão via d.ts)
const RemoteHeader = React.lazy(() => import("remote1/Header"));
const SharedButton = React.lazy(() => import("remote1/SharedButton"));
const RemoteWidget = React.lazy(() => import("remote1/RemoteWidget"));

const App: React.FC = () => {
  return (
    <React.Suspense fallback={<p>Carregando remotos…</p>}>
      <div style={{ fontFamily: "system-ui, sans-serif", padding: 20 }}>
        <RemoteHeader title="Host App" />

        <p>This app(host) is being consuming components from  <code>remote1</code>.</p>

        <SharedButton onClick={() => alert("Clique no botão remoto!")}>
          Remote Button
        </SharedButton>

        <RemoteWidget />
      </div>
    </React.Suspense>
  );
};

export default App;
