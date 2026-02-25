# Routes POC

This project contains three routing approaches side-by-side so you can compare them.
It is now in TypeScript to highlight TanStack Router's strongest advantage: typed routes/search params.

## How to run

Classic (React Router component router):
```
npm run dev:classic
```

Data router (React Router with loaders + lazy routes):
```
npm run dev:data
```

TanStack Router (loaders + lazy routes):
```
npm run dev:tanstack
```

If your shell doesn't support `VITE_ROUTER_MODE=...` (e.g. Windows cmd), run:
```
set VITE_ROUTER_MODE=classic&& npm run dev
```
```
set VITE_ROUTER_MODE=data&& npm run dev
```
```
set VITE_ROUTER_MODE=tanstack&& npm run dev
```

## Files

- `src/app-classic.jsx`: React Router component router (BrowserRouter + Routes)
- `src/app-data.jsx`: React Router data router (createBrowserRouter + loaders + lazy routes)
- `src/app-tanstack.jsx`: TanStack Router (route tree + loaders + lazy routes)
- `src/loaders/dataLoaders.js`: React Router loaders
- `src/tanstack/loaders.js`: TanStack loaders
- `src/routes/About.jsx`, `src/routes/DashboardSettings.jsx`: lazy-loaded React Router route components
- `src/tanstack/routes/about.lazy.jsx`, `src/tanstack/routes/dashboard-settings.lazy.jsx`: lazy-loaded TanStack route components

## Tradeoffs

React Router (component router):
- Pros: Very simple mental model, easiest incremental adoption, huge ecosystem.
- Cons: No built-in data loading or per-route error boundaries; you wire data fetching manually.
- Code splitting: Manual via `React.lazy` + `Suspense`.

React Router (data router):
- Pros: First-class loaders/actions, route-level error boundaries, navigation state handling.
- Cons: More boilerplate and different APIs; you adopt the data-router model for many features.
- Code splitting: First-class via route `lazy()`.

TanStack Router:
- Pros: Strong URL/state tooling, explicit route tree, great for complex routing, powerful search param handling.
- Cons: Smaller ecosystem and team familiarity, different mental model.
- Code splitting: First-class via route `lazy()`.

## Opinion (best vs most popular)

- Most popular: React Router is by far the most widely used routing library in React (based on download stats).
- Best (my opinion):
  - For teams that want the broadest adoption and easiest onboarding, React Router data router is the safest default.
  - If you need tight control over route state/search params and want type safety, TanStack Router is excellent.
