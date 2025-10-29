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




---

## 1. Shared Modules in Module Federation

The `shared` configuration controls **how dependencies are shared** across federated applications (host and remotes).

```js
shared: {
  react: { singleton: true, requiredVersion: deps.react },
  "react-dom": { singleton: true, requiredVersion: deps["react-dom"] },
  zustand: { singleton: true, requiredVersion: deps["zustand"] },
},
```

### Explanation

#### **Purpose**
- Prevents **duplicated copies** of the same dependency from being bundled into each remote or host.
- Ensures **React, ReactDOM, Zustand, etc.** are instantiated only **once at runtime**.

#### **Key Properties**

| Property | Meaning |
|-----------|----------|
| `singleton: true` | Forces the dependency to exist only **once** in memory. Useful for stateful libs like React. |
| `requiredVersion` | The version expected by this app. Webpack ensures all apps agree on compatible versions. |
| `strictVersion` *(optional)* | If enabled, throws an error when versions mismatch instead of silently falling back. |
| `eager` *(optional)* | When true, loads the dependency immediately instead of lazily. Usually avoided for React. |

#### **Why it matters**
React must be **singleton** because its internal hook system cannot work if different apps have distinct React instances — you’d get errors like *"Invalid hook call"*.  
By sharing React and Zustand as singletons, both host and remote literally use the **same runtime React context**, allowing hooks, state, and context to work seamlessly across boundaries.

---

## 2. The Pure Store (`pureStore`)

`pureStore` is a **custom vanilla shared state implementation** — no external libraries like Zustand are used.

```ts
export type CounterState = { count: number };

type Listener = () => void;
const state: CounterState = { count: 0 };
const listeners = new Set<Listener>();

function emit() {
  for (const l of Array.from(listeners)) l();
}

export const counterStore = {
  get(): CounterState {
    return state;
  },
  set(patch: Partial<CounterState> | ((s: CounterState) => Partial<CounterState>)) {
    const next = typeof patch === "function" ? patch(state) : patch;
    Object.assign(state, next);
    emit();
  },
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  inc(delta = 1) {
    counterStore.set((s) => ({ count: s.count + delta }));
  },
  dec(delta = 1) {
    counterStore.set((s) => ({ count: Math.max(0, s.count - delta) }));
  },
  reset() {
    counterStore.set({ count: 0 });
  }
};
```

### How it works

| Function | Description |
|-----------|--------------|
| `get()` | Returns the **current state snapshot**. |
| `set(patch)` | Updates the state (either with an object or updater function). After updating, calls `emit()`. |
| `subscribe(listener)` | Adds a function to the listeners set, returning an **unsubscribe** function. |
| `emit()` | Notifies all listeners that the state changed. |
| `inc`, `dec`, `reset` | Convenience methods that internally call `set()` and trigger updates. |

This design mimics a **simplified Redux/Zustand** pattern: a global state object with a pub/sub system.

---

## 3. React Integration with `useSyncExternalStore`

React 18 introduced the **`useSyncExternalStore`** hook — a native way to subscribe to external stores.

```ts
const count = useSyncExternalStore(subscribe, getSnapshot);
```

### Arguments

| Parameter | Purpose |
|------------|----------|
| `subscribe` | A function `(listener) => unsubscribe`, used to register updates. |
| `getSnapshot` | A function that returns the **current snapshot** of data. |

React calls `subscribe` to listen for changes, and whenever `emit()` triggers an update, React automatically re-renders components that depend on the snapshot value.

### Example

```ts
export const subscribe = counterStore.subscribe;
export const getSnapshot = () => counterStore.get().count;
```

Used in React:

```tsx
const count = useSyncExternalStore(subscribe, getSnapshot);
```

Whenever `counterStore.set()` changes the count and calls `emit()`, React re-renders with the new value.

---

## 4. Understanding `Partial<T>`

`Partial<T>` is a **TypeScript utility type** that makes all properties of a type optional.

### Example

```ts
type CounterState = { count: number };
type Partial<CounterState> = { count?: number };
```

This means you can pass **only part of the state** when updating, without redefining everything:

```ts
counterStore.set({ count: 42 }); // OK
```

or even dynamically:

```ts
counterStore.set((prev) => ({ count: prev.count + 1 }));
```

Internally, TypeScript sees that the update might not include all keys of `CounterState`, and `Object.assign` merges only the provided properties.

---

## 5. Putting It All Together

1. The **host** exposes `pureStore` via Module Federation.
2. The **remote** imports `pureStore` dynamically with `import("host/pureStore")`.
3. Both apps interact with the **same shared instance** of the store in memory.
4. Components use `useSyncExternalStore(subscribe, getSnapshot)` to stay reactive.
5. Updates in one app trigger `emit()`, notifying all subscribers — even across apps.

This setup achieves **global state sharing without libraries**, using only native browser modules, Webpack Federation runtime, and React’s built-in hooks.

---

### Key Takeaways

- **`shared`** keeps dependencies consistent and prevents duplicate React runtimes.
- **`pureStore`** is a minimal, dependency-free shared state pattern.
- **`subscribe`** and **`getSnapshot`** provide the pub/sub bridge for React.
- **`useSyncExternalStore`** is the native way to connect React to any external source.
- **`Partial<T>`** allows flexible, type-safe updates to parts of an object.

Together, these patterns form the foundation of **microfrontends with real-time shared state**, even without external libraries like Redux or Zustand.


## Screenshots
<img width="1215" height="273" alt="image" src="https://github.com/user-attachments/assets/cc5f7681-16e8-4bda-a6b3-083af720a62a" />


<img width="1018" height="527" alt="image" src="https://github.com/user-attachments/assets/0d2a9b0d-944b-433c-b5a6-407b0a47ef59" />

<img width="863" height="476" alt="image" src="https://github.com/user-attachments/assets/524d2948-5a77-4b79-9d11-e0c344f1c760" />

<img width="516" height="519" alt="image" src="https://github.com/user-attachments/assets/54c9dbcf-d60b-4bed-8674-c5eb3ea0edae" />


