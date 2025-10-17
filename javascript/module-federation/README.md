# React + TypeScript Module Federation Example

This project demonstrates a minimal **React + TypeScript** setup using **Webpack 5 Module Federation**.  
It consists of two independent applications that share React components dynamically at runtime:

- **`host`** – the main container application.  
- **`remote1`** – a secondary application that both exposes and consumes federated modules.

---

## Project Overview

The goal is to show how two standalone React applications can:

1. **Expose components** to be used by others.
2. **Consume components** exposed by remote applications.
3. **Share React runtime** (`react`, `react-dom`) between both, avoiding duplication.
4. Use **asynchronous bootstrapping** to ensure proper shared module initialization.

Both applications are fully independent — each has its own `webpack.config.js`, `package.json`, and development server.

---

## 1. Remote Application (`remote1`)

### Purpose
`remote1` exposes several React components that can be consumed by other applications (like `host`), and also consumes a component (`Card`) from the host.  
This demonstrates **bidirectional federation**.

### Webpack Configuration
```js
new ModuleFederationPlugin({
  name: "remote1",
  filename: "remoteEntry.js",
  // remote1 also consumes the host
  remotes: {
    host: "host@http://localhost:3000/remoteEntry.js"
  },
  exposes: {
    "./Header": "./src/components/Header.tsx",
    "./SharedButton": "./src/components/SharedButton.tsx",
    "./RemoteWidget": "./src/components/RemoteWidget.tsx"
  },
  shared: {
    react: { singleton: true, requiredVersion: deps.react },
    "react-dom": { singleton: true, requiredVersion: deps["react-dom"] }
  }
});
```

### Exposed Components
- `Header` – A simple header component.
- `SharedButton` – A styled reusable button.
- `RemoteWidget` – A widget that consumes the `Card` component from the host.

---

## 2. Host Application (`host`)

### Purpose
`host` serves as the main application and loads components dynamically from `remote1`.  
It also exposes its own `Card` component, which can be consumed by remotes.

### Webpack Configuration
```js
new ModuleFederationPlugin({
  name: "host",
  filename: "remoteEntry.js",
  remotes: {
    remote1: "remote1@http://localhost:3001/remoteEntry.js"
  },
  exposes: {
    "./Card": "./src/components/Card.tsx"
  },
  shared: {
    react: { singleton: true, requiredVersion: deps.react },
    "react-dom": { singleton: true, requiredVersion: deps["react-dom"] }
  }
});
```

### Exposed Components
- `Card` – A simple reusable UI container with a title and content area.

---

## 3. Shared Modules

Both projects share:
```js
shared: {
  react: { singleton: true, requiredVersion: deps.react },
  "react-dom": { singleton: true, requiredVersion: deps["react-dom"] }
}
```

This ensures that only one instance of React and ReactDOM is used across both applications, preventing version conflicts and runtime duplication errors.

---

## 4. Asynchronous Bootstrap

Each application uses an **async entry point** to avoid the `Shared module is not available for eager consumption` error:

- Entry file (`main.ts`):
  ```ts
  import("./bootstrap");
  ```

- Bootstrap file (`bootstrap.tsx`):
  ```tsx
  import React from "react";
  import { createRoot } from "react-dom/client";
  import App from "./App";

  createRoot(document.getElementById("app")!).render(<App />);
  ```

This guarantees that the module federation runtime initializes before React starts rendering.

---

## 5. Running Locally

In separate terminals:

```bash
# Remote
cd remote1
npm run dev

# Host
cd host
npm run dev
```

Access the apps:
- **Host:** http://localhost:3000  
- **Remote:** http://localhost:3001  

The host loads `Header`, `SharedButton`, and `RemoteWidget` from the remote, while the remote loads `Card` from the host.

---

## Summary

This setup demonstrates:

- **Dynamic runtime sharing** of React components between multiple standalone apps.
- **Bidirectional federation**, where both sides act as hosts and remotes.
- **Singleton React runtime**, avoiding duplicate React instances.
- **Async initialization** to ensure shared module stability in development.

It serves as a foundation for **microfrontend architectures** using **Webpack 5 Module Federation** with **React and TypeScript**.