import React from "react";
import Header from "./components/Header";
import SharedButton from "./components/SharedButton";
import RemoteWidget from "./components/RemoteWidget";
import SharedStateDemo from "./components/SharedStateDemo";
import PureSharedStateDemo from "./components/PureSharedStateDemo";

const HostCounterPanel = React.lazy(() => import("host/HostCounterPanel"));
const HostPureCounterPanel = React.lazy(() => import("host/HostPureCounterPanel"));


const App: React.FC = () => {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: 20 }}>
      <Header title="Remote1 App" />
      <p>This app (remote1) **exposes** components and also **consumes** from host.</p>
      <SharedButton onClick={() => alert("Clique dentro do remote1!")}>
        Button (remote1)
      </SharedButton>
      <div style={{ marginTop: 12 }}>
        <RemoteWidget />
      </div>
      <SharedStateDemo />
      <HostCounterPanel />


      <PureSharedStateDemo />
      <HostPureCounterPanel />
    </div>
  );
};

export default App;
