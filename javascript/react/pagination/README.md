# React Pagination Playground

This project contains three pagination demos built with React:

- `react-window` for pagination combined with list virtualization
- `@tanstack/react-query` + `@tanstack/react-table` for server-side offset pagination
- `@tanstack/react-query` for server-side cursor pagination

The app keeps a local dataset for the virtualization example and uses a real Node backend for the TanStack example.

## Run locally

```bash
npm install
npm run server
npm run dev
```

Run `npm run server` in one terminal and `npm run dev` in another.

Available pages:

- `#/` for the `react-window` demo
- `#/offset-server` for the server-side offset demo
- `#/cursor-server` for the server-side cursor demo

## Project idea

The project now shows three different pagination layers:

- UI pagination plus virtualization
- real backend offset pagination where the browser receives only the requested page
- real backend cursor pagination where the browser advances through stable markers

So even though all pages talk about pagination, each one emphasizes a different concern.

## Local data layer

The file `src/data/registrations.ts` contains:

- the local mock dataset used by the `react-window` demo

## Real backend demo

The file `server/index.mjs` starts a small Node HTTP server with:

- an in-memory array of `50,000` items
- a `GET /api/registrations?page=1&pageSize=15` endpoint
- a `GET /api/registrations-cursor?pageSize=15&cursor=API-000015` endpoint
- validation for `page` and `pageSize`
- a small artificial delay so Query loading states are visible

The frontend page at `#/offset-server` sends the current page and page size to the offset API.

That response is then used directly by TanStack Query and TanStack Table with manual pagination enabled.

The frontend page at `#/cursor-server` sends the last seen item ID as a cursor and requests the next slice from the cursor API.

## Navigation between demos

The root `App` uses a small hash-based navigation system:

- `#/` renders the `react-window` page
- `#/offset-server` renders the server-side offset page
- `#/cursor-server` renders the server-side cursor page

## When to use each approach

Use `react-window` when:

- you already have a large list in memory
- rendering too many rows is the performance problem
- row virtualization is the main goal

Use offset pagination when:

- the server should own pagination
- the browser must not download the entire dataset
- the request needs explicit `page` and `pageSize` parameters
- you want the UI closer to a production setup

Use cursor pagination when:

- the user navigates sequentially through a feed
- the dataset changes often and stable ordering matters
- deep offsets would become expensive
