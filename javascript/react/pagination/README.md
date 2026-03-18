# React Pagination Playground

This project contains three pagination demos built with React:

- `react-window` for pagination combined with list virtualization
- `@tanstack/react-query` + `@tanstack/react-table` for server-style pagination with local mocks
- a real Node backend returning paginated data to `@tanstack/react-query` + `@tanstack/react-table`

The app keeps the local dataset for the first two examples and adds a real backend dataset for the third example so it is easier to compare the patterns.

## Run locally

```bash
npm install
npm run server
npm run dev
```

Run `npm run server` in one terminal and `npm run dev` in another.

Available pages:

- `#/` for the `react-window` demo
- `#/tanstack` for the TanStack Query + Table demo with local mock data
- `#/backend` for the real backend pagination demo

## Project idea

The project now shows three different pagination layers:

- UI pagination plus virtualization
- client-side querying of page slices with a mocked async source
- real backend pagination where the browser receives only the requested page

So even though all pages talk about pagination, each one emphasizes a different concern.

## Shared local data layer

The file `src/data/registrations.ts` contains:

- the local mock dataset used by the first two demos
- `fetchRegistrationsPage(pageIndex, pageSize)` to simulate an async paginated source

This keeps the original examples simple while still resembling a paginated API contract.

## Real backend demo

The file `server/index.mjs` starts a small Node HTTP server with:

- an in-memory array of `50,000` items
- a `GET /api/registrations?page=1&pageSize=15` endpoint
- validation for `page` and `pageSize`
- a small artificial delay so Query loading states are visible

The frontend page at `#/backend` sends the current page and page size to that API.

That response is then used directly by TanStack Query and TanStack Table with manual pagination enabled.

## Navigation between demos

The root `App` uses a small hash-based navigation system:

- `#/` renders the `react-window` page
- `#/tanstack` renders the local TanStack page
- `#/backend` renders the real backend page

## When to use each approach

Use `react-window` when:

- you already have a large list in memory
- rendering too many rows is the performance problem
- row virtualization is the main goal

Use TanStack Query + Table with a local async source when:

- you want to prototype server-style pagination without creating an API
- you want caching and controlled table state
- you want to explain the flow before introducing networking

Use TanStack Query + Table with a real backend when:

- the server should own pagination
- the browser must not download the entire dataset
- the request needs explicit `page` and `pageSize` parameters
- you want the UI closer to a production setup
