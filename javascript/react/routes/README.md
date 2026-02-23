# Routes POC

This project contains two routing approaches side-by-side so you can compare them.

## How to run

Classic (component router):
```
npm run dev:classic
```

Data router (loaders + route-level code splitting):
```
npm run dev:data
```

If your shell doesn't support `VITE_ROUTER_MODE=...` (e.g. Windows cmd), run:
```
set VITE_ROUTER_MODE=classic&& npm run dev
```
```
set VITE_ROUTER_MODE=data&& npm run dev
```

## Files

- `src/app-classic.jsx`: BrowserRouter + Routes (classic component router)
- `src/app-data.jsx`: createBrowserRouter + loaders + lazy routes
- `src/loaders/dataLoaders.js`: separated data loader functions
- `src/routes/About.jsx`, `src/routes/DashboardSettings.jsx`: lazy-loaded route components

## Tradeoffs

Classic (BrowserRouter + Routes):
- Pros: Simple mental model, straightforward for purely client-side apps, easy to adopt incrementally.
- Cons: No built-in data loading or error boundaries per route; you wire data fetching and loading states manually.
- Code splitting: You can lazy-load route components via `React.lazy` + `Suspense`, but it is manual.

Data router (createBrowserRouter):
- Pros: Built-in loaders and route-level error boundaries, better control over navigation states, easy per-route data prefetching.
- Cons: Slightly more boilerplate, different APIs, and you generally commit to the data-router mental model.
- Code splitting: `lazy()` on routes is first-class and more ergonomic.
