import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

async function start() {
  const mode = import.meta.env.VITE_ROUTER_MODE ?? 'classic';

  if (mode === 'data') {
    const { RouterProvider } = await import('react-router-dom');
    const { router } = await import('./app-data.jsx');

    root.render(
      <React.StrictMode>
        <RouterProvider router={router} />
      </React.StrictMode>
    );
    return;
  }

  const { AppClassic } = await import('./app-classic.jsx');
  root.render(
    <React.StrictMode>
      <AppClassic />
    </React.StrictMode>
  );
}

start();
