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

## Offset vs cursor tradeoffs

### Offset pagination

Pros:

- simpler to explain and implement
- works well with classic numbered pagination like page 1, 2, 3
- easy to support direct jumps to a specific page

Cons:

- performance degrades on deep pages because the database still has to walk past the skipped rows internally
- inserts or deletes between requests can cause repeated or missing items
- large offsets can become expensive in relational SQL databases

Practical SQL example:

```sql
SELECT id, title, category, status, updated_at
FROM registrations
ORDER BY id
LIMIT 15 OFFSET 3000;
```

Even though the result only returns 15 rows, the database may still need to scan and discard the first 3000 rows to reach that page.

### Cursor pagination

Pros:

- better performance for large datasets and sequential navigation
- more stable when rows are inserted or deleted between requests
- usually works better for infinite scroll or feed-like experiences

Cons:

- more complex to implement
- requires a stable and indexed sort order
- does not map naturally to numbered pagination or jump-to-page behavior

Practical SQL example:

```sql
SELECT id, title, category, status, updated_at
FROM registrations
WHERE id > :cursorId
ORDER BY id
LIMIT 15;
```

For UUID-based databases, the cursor should usually be based on a stable ordering column such as `created_at, id`, unless the identifier itself is time-ordered, like UUIDv7.

### Security and API concerns

- neither approach is inherently more secure by itself
- both should validate `limit`, `offset`, and `cursor` values
- both should use parameterized queries
- offset endpoints should cap maximum offset or page size to avoid very expensive queries
- cursor endpoints often return an opaque cursor instead of exposing raw internal values directly

### Usability tradeoffs

- offset is usually better for admin tables, reporting screens, and UIs that need page numbers
- cursor is usually better for feeds, timelines, and infinite scroll
- offset is easier for users who want to jump directly to page N
- cursor is better when consistency between one request and the next matters more than page numbers
