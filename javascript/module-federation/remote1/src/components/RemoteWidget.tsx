import React from "react";

// Consumindo o Card exposto pelo host
const Card = React.lazy(() => import("host/Card"));

const RemoteWidget: React.FC = () => {
  return (
    <React.Suspense fallback={<p>Loading Card from host…</p>}>
      <Card title="RemoteWidget">
        <p>This widget (remotelly) is being using a <code>Card</code> from host.</p>
      </Card>
    </React.Suspense>
  );
};

export default RemoteWidget;
