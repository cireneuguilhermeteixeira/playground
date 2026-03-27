# IndexedDB Notes

This project is a small React + TypeScript CRUD example using IndexedDB.

It stores items locally in the browser, so the data can still be read and changed even when the page is offline after it has already loaded.

## What `onupgradeneeded` is for

`onupgradeneeded` is not required on every `indexedDB.open()` call.

It only runs when:

- the database does not exist yet
- the version passed to `indexedDB.open(name, version)` is greater than the current version

This event is used for schema setup and schema changes, such as:

- creating an `objectStore`
- creating indexes
- removing stores or indexes
- changing the database structure in a new version

Example from this project:

```ts
const request = indexedDB.open(DB_NAME, DB_VERSION);

request.onupgradeneeded = () => {
  const database = request.result;

  if (!database.objectStoreNames.contains(STORE_NAME)) {
    database.createObjectStore(STORE_NAME, {
      keyPath: "id",
      autoIncrement: true,
    });
  }
};
```

## What `createObjectStore()` defines

`createObjectStore()` creates a data collection inside the database.

You can think of it as roughly similar to a table in a relational database.

In this project:

```ts
database.createObjectStore(STORE_NAME, {
  keyPath: "id",
  autoIncrement: true,
});
```

That means:

- the store name is `items`
- each record uses `id` as its primary key
- if `id` is missing, IndexedDB generates it automatically

Because `autoIncrement: true` is enabled, this works:

```ts
store.add({ name: "Alice" });
```

IndexedDB will generate the `id`.

If the store had `keyPath: "id"` without `autoIncrement: true`, then adding an object without `id` would fail.

## Why transactions exist

IndexedDB requires operations to run inside a transaction.

The transaction defines:

- which store or stores are being accessed
- whether the access is read-only or writable
- the lifetime of that unit of work

That is why the API is usually:

```ts
const transaction = database.transaction("items", "readwrite");
const store = transaction.objectStore("items");
store.put({ id: 1, name: "Alice" });
```

The steps are separate on purpose:

1. open a transaction
2. get the store from that transaction
3. run the request on that store

## `readonly` vs `readwrite`

The main transaction modes used in normal application code are:

- `readonly`: read data only
- `readwrite`: read and modify data

This project uses both:

```ts
const readTx = database.transaction(STORE_NAME, "readonly");
const writeTx = database.transaction(STORE_NAME, "readwrite");
```

Use `readonly` for methods like:

- `get`
- `getAll`
- cursors used only for reading

Use `readwrite` for methods like:

- `add`
- `put`
- `delete`
- `clear`

There is also `versionchange`, but that is mainly part of the database upgrade flow and is not the mode you typically use for everyday CRUD operations.

## Why `transaction` and `objectStore` are separate

They represent different concerns:

- `transaction` is the execution context
- `objectStore` is the specific collection you want to access

So this is expected:

```ts
const transaction = database.transaction(STORE_NAME, "readonly");
const store = transaction.objectStore(STORE_NAME);
const request = store.getAll();
```

The API is more explicit than a single chained shortcut because IndexedDB is designed around transaction boundaries.

## What happens if `put()` is called without an `id`

It depends on how the store was created.

If the store is:

```ts
createObjectStore("items", { keyPath: "id" });
```

then this would fail:

```ts
store.put({ name: "Alice" });
```

because there is no `id`.

If the store is:

```ts
createObjectStore("items", { keyPath: "id", autoIncrement: true });
```

then IndexedDB can generate the `id`, so the same write can succeed.

That is the setup used in this project.

## Is `navigator.onLine` part of the browser?

Yes. `navigator.onLine` is a native browser property.

This project uses it here:

```ts
const [isOnline, setIsOnline] = useState(navigator.onLine);
```

And listens to the browser events:

```ts
window.addEventListener("online", handleOnlineStatus);
window.addEventListener("offline", handleOnlineStatus);
```

Important detail:

- `navigator.onLine` is useful for basic online/offline UI
- it does not guarantee that your backend or API is reachable

So it is good for connection status indicators, but not as a full health check for a server.

## Browser differences

The IndexedDB API is mostly the same across modern browsers.

In normal application code, the core features used in this project work in Chrome, Edge, Firefox, and Safari:

- `indexedDB.open()`
- `onupgradeneeded`
- `createObjectStore()`
- `createIndex()`
- transactions
- `get()`, `getAll()`
- indexes
- `IDBKeyRange`
- cursors

So the main differences are usually not about basic API support.

They are more about storage policy, persistence, eviction, and a few browser-specific extras.

### Chrome and Edge

Chrome and Edge use Chromium.

In practice:

- the standard IndexedDB API works as expected
- storage persistence decisions are usually handled automatically by browser heuristics
- current Chromium behavior uses a more relaxed default durability mode for better performance

That means IndexedDB is still transactional, but the browser does not try to force the strictest possible disk flush behavior by default.

### Firefox

Firefox also supports the standard IndexedDB API well.

The main extra detail is that Firefox has had some non-standard IndexedDB features, such as:

- `readwriteflush`
- `IDBLocaleAwareKeyRange`

These are Firefox-specific and should not be used if you want portable browser code.

For normal web apps, stick to the standard transaction modes and key range APIs.

### Safari

Safari supports the standard IndexedDB API too, but it is the browser that usually requires the most care in offline applications.

The main practical difference is storage policy.

Safari is more aggressive about removing site data in some situations, especially when browser heuristics decide the stored data is not strongly persistent.

So while the API itself is available, Safari can be less forgiving for long-lived offline storage.

### Storage persistence and eviction

If your app stores important offline data, the biggest cross-browser concern is usually not whether `get()` or `createIndex()` exists.

The bigger concern is whether the browser may delete stored data later.

That is why APIs like this can matter in real applications:

```ts
const granted = await navigator.storage.persist();
```

This asks the browser to treat the origin's storage as persistent instead of best-effort storage.

Browsers handle this differently:

- Firefox may involve user-facing permission behavior
- Safari and Chromium-based browsers tend to rely more on heuristics

This project does not use `navigator.storage.persist()` because it is a learning demo.

For a real offline-first application, it may be worth checking.

### Practical rule

If you use only the standard IndexedDB API, your code will usually run across modern browsers.

The main portability rules are:

- use only standard IndexedDB APIs
- do not depend on Firefox-only extensions
- test offline storage behavior in Safari if persistence matters
- treat quota and eviction behavior as browser-dependent

## How this project uses IndexedDB

The main database code is in `src/db.ts`.

It exposes:

- `openDatabase()`
- `listItems()`
- `createItem()`
- `updateItem()`
- `deleteItem()`

The app component in `src/App.tsx` opens the database on load, reads all items, and updates the UI after each CRUD operation.

## Running the project

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```
