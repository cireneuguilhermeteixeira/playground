# React Pagination Playground

This project contains two pagination demos built with React:

- `react-window` for pagination combined with list virtualization
- `@tanstack/react-query` + `@tanstack/react-table` for server-style pagination

The app uses the same mock dataset in both examples so it is easier to compare the patterns.

## Run locally

```bash
npm install
npm run dev
```

Available pages:

- `#/` for the `react-window` demo
- `#/tanstack` for the TanStack Query + Table demo

## Project idea

Both examples work with a dataset of `10,000` registrations.

They solve different problems:

- `react-window` reduces how many DOM nodes are rendered at once
- `react-query` manages asynchronous data fetching and caching
- `react-table` organizes tabular data and controlled pagination state

So even though both pages talk about pagination, they focus on different layers of the UI.

## Shared data layer

The file `src/data/registrations.ts` contains:

- the `Registration` type
- the full mock dataset
- `fetchRegistrationsPage(pageIndex, pageSize)`

That function simulates a paginated API:

1. It receives `pageIndex` and `pageSize`
2. It waits for a small delay
3. It returns only the requested slice
4. It also returns the total row count

This is important for the TanStack demo because it behaves more like a real backend response than a simple local `.slice()` inside the component.

## Demo 1: `react-window`

This page shows pagination plus virtualization.

### What problem it solves

If you render a very large list with a normal `.map()`, the browser has to create and manage many DOM nodes. That becomes expensive.

`react-window` solves that by rendering only the rows visible inside the viewport.

### How this demo works

The page still has normal pagination controls:

- first
- previous
- next
- last
- go to page

When the user changes page, the component creates `currentItems`, which is the current slice of the full dataset.

Then `react-window` renders only the visible rows from that slice.

### Main `List` configuration

```tsx
<List
  rowComponent={Row}
  rowCount={currentItems.length}
  rowHeight={ROW_HEIGHT}
  rowProps={{ items: currentItems }}
  style={{ height: LIST_HEIGHT }}
/>
```

What each part does:

- `rowComponent`: component used to render one row
- `rowCount`: total rows in the current page
- `rowHeight`: fixed height used for layout calculations
- `rowProps`: extra props passed to each row
- `style.height`: viewport height of the virtualized list

### The row component

The row renderer receives:

- `index`: position of the row inside the current page
- `style`: inline style required by `react-window`
- `items`: current page data
- `ariaAttributes`: accessibility attributes from the library

The `style` prop is required. Without it, the virtualized rows will not be positioned correctly.

### Mental model

Think of this page as:

- full dataset in memory
- current page chosen by local state
- virtualized viewport over that page

So pagination decides **which data slice** is active, and `react-window` decides **which rows become DOM**.

## Demo 2: TanStack Query + TanStack Table

This page shows server-style pagination.

### What problem it solves

In a real app, you usually do not want to load every row into the UI and then paginate locally. Instead, you ask the server for only one page at a time.

This is where TanStack Query and TanStack Table fit well together:

- `react-query` fetches and caches the current page
- `react-table` manages table structure and controlled pagination state

### How the flow works

The page keeps pagination in local state:

```tsx
const [pagination, setPagination] = useState({
  pageIndex: 0,
  pageSize: 12,
})
```

That state is used by React Query:

```tsx
const registrationsQuery = useQuery({
  queryKey: ['registrations', pagination.pageIndex, pagination.pageSize],
  queryFn: () =>
    fetchRegistrationsPage(pagination.pageIndex, pagination.pageSize),
  placeholderData: keepPreviousData,
})
```

### What each Query part does

- `queryKey`: identifies the cached page request
- `queryFn`: fetches the page data
- `placeholderData: keepPreviousData`: keeps the previous page visible while the next page is loading

That last option makes the UI feel more stable because the table does not go empty between page changes.

### How TanStack Table is configured

```tsx
const table = useReactTable({
  data: registrationsQuery.data?.rows ?? [],
  columns,
  state: { pagination },
  onPaginationChange: setPagination,
  getCoreRowModel: getCoreRowModel(),
  manualPagination: true,
  rowCount: registrationsQuery.data?.rowCount ?? 0,
})
```

### What each Table part does

- `data`: rows returned by the current query
- `columns`: table column definitions
- `state.pagination`: controlled pagination state
- `onPaginationChange`: updates page index and page size
- `getCoreRowModel()`: basic row model generation
- `manualPagination: true`: tells the table that pagination is handled outside the table
- `rowCount`: total number of rows across all pages

`manualPagination` is a key detail. It means the table should not try to paginate the current page data by itself. It should trust the external fetch and pagination state.

### How the UI updates

When the user clicks `Next`:

1. the table changes `pageIndex`
2. the query key changes
3. React Query fetches the new page
4. the previous page stays visible during loading
5. the table receives the new rows and updates

This is very close to how a production app would behave with a real API.

## Navigation between demos

The root `App` uses a small hash-based navigation system:

- `#/` renders the `react-window` page
- `#/tanstack` renders the TanStack page

This keeps the project simple while still giving each example its own page.

## When to use each approach

Use `react-window` when:

- you already have a large list in memory
- rendering too many rows is the performance problem
- row virtualization is the main goal

Use TanStack Query + Table when:

- data should be fetched page by page
- you want caching and loading states
- the UI is table-oriented
- pagination state needs to be explicit and controlled

## Summary

This project demonstrates two different ideas:

- `react-window` optimizes rendering
- TanStack Query + TanStack Table optimize data fetching and table state

Both are valid pagination-related patterns, but they solve different parts of the problem.
