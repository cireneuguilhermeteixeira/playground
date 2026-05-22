# SWR POC

React POC to demonstrate `SWR`, Vercel's library for fetching, caching, and revalidation.

## What the demo covers

- `useSWR` for reads with automatic cache
- `refreshInterval` for periodic revalidation
- `revalidateOnFocus` via `SWRConfig`
- `useSWRMutation` for creation
- `mutate` with optimistic updates for status changes

## Run locally

```bash
npm install
npm run dev
```

## Structure

- `src/mockApi.ts`: local async mock that simulates an API
- `src/App.tsx`: main demo with listing, creation, and optimistic mutation
- `src/types.ts`: domain types

## POC idea

Instead of using `useEffect` + `useState` + manual loading/cache control, SWR centralizes:

- initial fetch
- deduplication
- background revalidation
- cache update after mutation

This makes the component more declarative and closer to the recommended flow for remote data in React.
