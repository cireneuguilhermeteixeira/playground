import { FormEvent, useEffect, useState } from "react";
import {
  createItem,
  deleteItem,
  getFirstItemByCategory,
  getItemById,
  getItemsByExactName,
  getItemsCreatedAfter,
  getItemsCreatedAtOnly,
  getItemsCreatedBefore,
  getItemsCreatedBetween,
  Item,
  ItemCategory,
  listItems,
  openDatabase,
  searchItemsWithCursor,
  updateItem,
} from "./db";

const CATEGORY_OPTIONS: ItemCategory[] = ["work", "personal", "study", "shopping"];
const CURSOR_DIRECTIONS: IDBCursorDirection[] = ["next", "prev"];

function formatTimestamp(timestamp: number) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(timestamp);
}

function toDateTimeInputValue(timestamp: number) {
  const date = new Date(timestamp);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

function fromDateTimeInputValue(value: string) {
  if (!value) {
    return Number.NaN;
  }

  return new Date(value).getTime();
}

type SearchMeta = {
  label: string;
  items: Item[];
};

export default function App() {
  const [database, setDatabase] = useState<IDBDatabase | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<ItemCategory>("work");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [status, setStatus] = useState("Opening database...");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [searchMeta, setSearchMeta] = useState<SearchMeta>({
    label: "No search executed yet.",
    items: [],
  });
  const [exactId, setExactId] = useState("");
  const [exactName, setExactName] = useState("");
  const [exactCategory, setExactCategory] = useState<ItemCategory>("work");
  const [createdAtOnly, setCreatedAtOnly] = useState("");
  const [createdAfter, setCreatedAfter] = useState("");
  const [createdBefore, setCreatedBefore] = useState("");
  const [createdBetweenStart, setCreatedBetweenStart] = useState("");
  const [createdBetweenEnd, setCreatedBetweenEnd] = useState("");
  const [cursorCategory, setCursorCategory] = useState<ItemCategory | "all">("all");
  const [cursorDirection, setCursorDirection] = useState<IDBCursorDirection>("next");
  const [cursorOffset, setCursorOffset] = useState("0");
  const [cursorLimit, setCursorLimit] = useState("5");

  useEffect(() => {
    function handleOnlineStatus() {
      setIsOnline(navigator.onLine);
    }

    window.addEventListener("online", handleOnlineStatus);
    window.addEventListener("offline", handleOnlineStatus);

    return () => {
      window.removeEventListener("online", handleOnlineStatus);
      window.removeEventListener("offline", handleOnlineStatus);
    };
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        const db = await openDatabase();
        setDatabase(db);
        setStatus("Database ready with indexes: by_name, by_category, by_created_at.");
        await refreshItems(db);
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Could not open database.");
      }
    })();
  }, []);

  async function refreshItems(db: IDBDatabase) {
    const nextItems = await listItems(db);
    setItems(nextItems);

    if (nextItems.length > 0) {
      const latest = nextItems[0].createdAt;
      setCreatedAtOnly((current) => current || toDateTimeInputValue(latest));
      setCreatedAfter((current) => current || toDateTimeInputValue(latest));
      setCreatedBefore((current) => current || toDateTimeInputValue(latest));
      setCreatedBetweenStart((current) => current || toDateTimeInputValue(nextItems[nextItems.length - 1].createdAt));
      setCreatedBetweenEnd((current) => current || toDateTimeInputValue(latest));
      setExactId((current) => current || String(nextItems[0].id ?? ""));
      setExactName((current) => current || nextItems[0].name);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!database) {
      return;
    }

    const trimmedName = name.trim();
    if (!trimmedName) {
      setStatus("Name is required.");
      return;
    }

    if (editingId === null) {
      await createItem(database, { name: trimmedName, category });
      setStatus("Item created.");
    } else {
      const original = items.find((item) => item.id === editingId);
      await updateItem(database, {
        id: editingId,
        name: trimmedName,
        category,
        createdAt: original?.createdAt ?? Date.now(),
      });
      setStatus("Item updated.");
      setEditingId(null);
    }

    setName("");
    setCategory("work");
    await refreshItems(database);
  }

  async function handleDelete(id: number) {
    if (!database) {
      return;
    }

    await deleteItem(database, id);
    setStatus(`Item ${id} deleted.`);

    if (editingId === id) {
      clearForm();
    }

    await refreshItems(database);
  }

  function handleEdit(item: Item) {
    setEditingId(item.id ?? null);
    setName(item.name);
    setCategory(item.category);
    setStatus(`Editing item ${item.id}.`);
  }

  function clearForm() {
    setEditingId(null);
    setName("");
    setCategory("work");
    setStatus("Form cleared.");
  }

  async function runSearch(label: string, resolver: () => Promise<Item[]>) {
    if (!database) {
      setStatus("Database is not ready yet.");
      return;
    }

    try {
      const nextItems = await resolver();
      setSearchMeta({ label, items: nextItems });
      setStatus(`${label} finished with ${nextItems.length} result(s).`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Search failed.");
    }
  }

  async function handleGetById() {
    const id = Number(exactId);
    if (!Number.isInteger(id)) {
      setStatus("Exact key search needs a numeric id.");
      return;
    }

    await runSearch(`get(${id}) on the primary key`, async () => {
      const item = await getItemById(database as IDBDatabase, id);
      return item ? [item] : [];
    });
  }

  async function handleGetByCategory() {
    await runSearch(`index.get("${exactCategory}") on by_category`, async () => {
      const item = await getFirstItemByCategory(database as IDBDatabase, exactCategory);
      return item ? [item] : [];
    });
  }

  async function handleExactNameSearch() {
    const trimmedName = exactName.trim();
    if (!trimmedName) {
      setStatus("Exact name search needs a value.");
      return;
    }

    await runSearch(`openCursor(IDBKeyRange.only("${trimmedName}")) on by_name`, async () =>
      getItemsByExactName(database as IDBDatabase, trimmedName),
    );
  }

  async function handleCreatedAtOnly() {
    const createdAt = fromDateTimeInputValue(createdAtOnly);
    if (Number.isNaN(createdAt)) {
      setStatus("Choose a valid timestamp for IDBKeyRange.only().");
      return;
    }

    await runSearch(`IDBKeyRange.only(${createdAt}) on by_created_at`, async () =>
      getItemsCreatedAtOnly(database as IDBDatabase, createdAt),
    );
  }

  async function handleLowerBound() {
    const createdAt = fromDateTimeInputValue(createdAfter);
    if (Number.isNaN(createdAt)) {
      setStatus("Choose a valid timestamp for lowerBound().");
      return;
    }

    await runSearch(`IDBKeyRange.lowerBound(${createdAt}) on by_created_at`, async () =>
      getItemsCreatedAfter(database as IDBDatabase, createdAt),
    );
  }

  async function handleUpperBound() {
    const createdAt = fromDateTimeInputValue(createdBefore);
    if (Number.isNaN(createdAt)) {
      setStatus("Choose a valid timestamp for upperBound().");
      return;
    }

    await runSearch(`IDBKeyRange.upperBound(${createdAt}) on by_created_at`, async () =>
      getItemsCreatedBefore(database as IDBDatabase, createdAt),
    );
  }

  async function handleBound() {
    const start = fromDateTimeInputValue(createdBetweenStart);
    const end = fromDateTimeInputValue(createdBetweenEnd);

    if (Number.isNaN(start) || Number.isNaN(end)) {
      setStatus("Choose valid start and end timestamps for bound().");
      return;
    }

    if (start > end) {
      setStatus("The bound() start must be less than or equal to the end.");
      return;
    }

    await runSearch(`IDBKeyRange.bound(${start}, ${end}) on by_created_at`, async () =>
      getItemsCreatedBetween(database as IDBDatabase, start, end),
    );
  }

  async function handleCursorSearch() {
    const offset = Number(cursorOffset);
    const limit = Number(cursorLimit);

    if (!Number.isInteger(offset) || offset < 0) {
      setStatus("Cursor offset must be a non-negative integer.");
      return;
    }

    if (!Number.isInteger(limit) || limit < 1) {
      setStatus("Cursor limit must be a positive integer.");
      return;
    }

    await runSearch(
      `openCursor(${cursorCategory === "all" ? "store" : `by_category:${cursorCategory}`}, ${cursorDirection}) with offset ${offset} and limit ${limit}`,
      async () =>
        searchItemsWithCursor(database as IDBDatabase, {
          category: cursorCategory,
          direction: cursorDirection,
          offset,
          limit,
        }),
    );
  }

  const totalItems = items.length;

  return (
    <main className="page-shell">
      <section className="hero card">
        <div>
          <p className="eyebrow">Browser Storage Playground</p>
          <h1>IndexedDB CRUD, indexes, key ranges, and cursor search</h1>
          <p className="lede">
            This demo stores records locally and exposes exact key lookups, index queries, range filters,
            and cursor-based pagination from the UI.
          </p>
        </div>
        <div className="hero-meta">
          <p><strong>Status:</strong> {status}</p>
          <p><strong>Connection:</strong> {isOnline ? "online" : "offline"}</p>
          <p><strong>Indexed records:</strong> {totalItems}</p>
          <p><strong>Indexes:</strong> by_name, by_category, by_created_at</p>
        </div>
      </section>

      <section className="layout-grid">
        <article className="card panel-span-2">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Write Path</p>
              <h2>Create or update an item</h2>
            </div>
            <button type="button" className="secondary-button" onClick={clearForm}>
              Clear form
            </button>
          </div>

          <form className="stack" onSubmit={(event) => void handleSubmit(event)}>
            <label>
              <span>Name</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Type a name"
              />
            </label>

            <label>
              <span>Category</span>
              <select value={category} onChange={(event) => setCategory(event.target.value as ItemCategory)}>
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <div className="button-row">
              <button type="submit">{editingId === null ? "Create item" : `Update item ${editingId}`}</button>
              <button type="button" className="secondary-button" onClick={() => database && void refreshItems(database)}>
                Refresh list
              </button>
            </div>
          </form>
        </article>

        <article className="card">
          <p className="eyebrow">Dataset</p>
          <h2>Current records</h2>
          <ul className="item-list">
            {items.map((item) => (
              <li key={item.id}>
                <div>
                  <strong>{item.name}</strong>
                  <p>
                    id {item.id} | {item.category} | {formatTimestamp(item.createdAt)}
                  </p>
                </div>
                <div className="button-row compact">
                  <button type="button" className="secondary-button" onClick={() => handleEdit(item)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => item.id !== undefined && void handleDelete(item.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
            {items.length === 0 ? <li className="empty-state">No records yet. Create a few items first.</li> : null}
          </ul>
        </article>
      </section>

      <section className="search-grid">
        <article className="card">
          <p className="eyebrow">Primary Key</p>
          <h2>`get(key)`</h2>
          <label>
            <span>Item id</span>
            <input value={exactId} onChange={(event) => setExactId(event.target.value)} placeholder="1" />
          </label>
          <button type="button" onClick={() => void handleGetById()}>
            Run exact key search
          </button>
        </article>

        <article className="card">
          <p className="eyebrow">Store Scan</p>
          <h2>`getAll()`</h2>
          <p className="card-copy">Reads every record from the object store in one call.</p>
          <button
            type="button"
            onClick={() => void runSearch("getAll() on the items store", async () => listItems(database as IDBDatabase))}
          >
            Load all items
          </button>
        </article>

        <article className="card">
          <p className="eyebrow">Index Lookup</p>
          <h2>`index.get(value)`</h2>
          <label>
            <span>Category index</span>
            <select value={exactCategory} onChange={(event) => setExactCategory(event.target.value as ItemCategory)}>
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <button type="button" onClick={() => void handleGetByCategory()}>
            Get first item in category
          </button>
        </article>

        <article className="card panel-span-2">
          <p className="eyebrow">Exact Match Via Index</p>
          <h2>`IDBKeyRange.only(value)` on `by_name`</h2>
          <div className="inline-controls">
            <label>
              <span>Name</span>
              <input value={exactName} onChange={(event) => setExactName(event.target.value)} placeholder="Alice" />
            </label>
            <button type="button" onClick={() => void handleExactNameSearch()}>
              Find duplicates by exact name
            </button>
          </div>
          <p className="card-copy">
            This uses the custom `by_name` index and a cursor so repeated names are all returned, not only the
            first match.
          </p>
        </article>

        <article className="card">
          <p className="eyebrow">Range Query</p>
          <h2>`only(createdAt)`</h2>
          <label>
            <span>Created at</span>
            <input
              type="datetime-local"
              value={createdAtOnly}
              onChange={(event) => setCreatedAtOnly(event.target.value)}
            />
          </label>
          <button type="button" onClick={() => void handleCreatedAtOnly()}>
            Run `only()`
          </button>
        </article>

        <article className="card">
          <p className="eyebrow">Range Query</p>
          <h2>`lowerBound(createdAt)`</h2>
          <label>
            <span>From timestamp</span>
            <input
              type="datetime-local"
              value={createdAfter}
              onChange={(event) => setCreatedAfter(event.target.value)}
            />
          </label>
          <button type="button" onClick={() => void handleLowerBound()}>
            Run `lowerBound()`
          </button>
        </article>

        <article className="card">
          <p className="eyebrow">Range Query</p>
          <h2>`upperBound(createdAt)`</h2>
          <label>
            <span>Until timestamp</span>
            <input
              type="datetime-local"
              value={createdBefore}
              onChange={(event) => setCreatedBefore(event.target.value)}
            />
          </label>
          <button type="button" onClick={() => void handleUpperBound()}>
            Run `upperBound()`
          </button>
        </article>

        <article className="card panel-span-2">
          <p className="eyebrow">Range Query</p>
          <h2>`bound(start, end)`</h2>
          <div className="inline-controls two-columns">
            <label>
              <span>Start timestamp</span>
              <input
                type="datetime-local"
                value={createdBetweenStart}
                onChange={(event) => setCreatedBetweenStart(event.target.value)}
              />
            </label>
            <label>
              <span>End timestamp</span>
              <input
                type="datetime-local"
                value={createdBetweenEnd}
                onChange={(event) => setCreatedBetweenEnd(event.target.value)}
              />
            </label>
          </div>
          <button type="button" onClick={() => void handleBound()}>
            Run `bound()`
          </button>
        </article>

        <article className="card panel-span-3">
          <p className="eyebrow">Cursor Search</p>
          <h2>`openCursor()` for ordering, offset, and limit</h2>
          <div className="inline-controls cursor-grid">
            <label>
              <span>Source</span>
              <select
                value={cursorCategory}
                onChange={(event) => setCursorCategory(event.target.value as ItemCategory | "all")}
              >
                <option value="all">Entire store</option>
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    by_category = {option}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Direction</span>
              <select
                value={cursorDirection}
                onChange={(event) => setCursorDirection(event.target.value as IDBCursorDirection)}
              >
                {CURSOR_DIRECTIONS.map((direction) => (
                  <option key={direction} value={direction}>
                    {direction}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Offset</span>
              <input value={cursorOffset} onChange={(event) => setCursorOffset(event.target.value)} />
            </label>
            <label>
              <span>Limit</span>
              <input value={cursorLimit} onChange={(event) => setCursorLimit(event.target.value)} />
            </label>
          </div>
          <button type="button" onClick={() => void handleCursorSearch()}>
            Run cursor search
          </button>
          <p className="card-copy">
            `next` walks ascending order. `prev` reverses that order. Offset and limit are implemented manually by
            deciding when the cursor starts collecting values and when it stops.
          </p>
        </article>
      </section>

      <section className="card">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Search Results</p>
            <h2>{searchMeta.label}</h2>
          </div>
          <p>{searchMeta.items.length} item(s)</p>
        </div>
        <ul className="result-list">
          {searchMeta.items.map((item) => (
            <li key={`${searchMeta.label}-${item.id}-${item.createdAt}`}>
              <strong>{item.name}</strong>
              <span>id {item.id}</span>
              <span>{item.category}</span>
              <span>{formatTimestamp(item.createdAt)}</span>
            </li>
          ))}
          {searchMeta.items.length === 0 ? (
            <li className="empty-state">Run one of the queries above to inspect how IndexedDB returns data.</li>
          ) : null}
        </ul>
      </section>
    </main>
  );
}
