export type ItemCategory = "work" | "personal" | "study" | "shopping";

export type Item = {
  id?: number;
  name: string;
  category: ItemCategory;
  createdAt: number;
};

export type CursorSearchInput = {
  category?: ItemCategory | "all";
  direction?: IDBCursorDirection;
  offset?: number;
  limit?: number;
};

const DB_NAME = "simple-crud-db";
const DB_VERSION = 2;
const STORE_NAME = "items";
const INDEX_BY_NAME = "by_name";
const INDEX_BY_CATEGORY = "by_category";
const INDEX_BY_CREATED_AT = "by_created_at";
const DEFAULT_CURSOR_LIMIT = 5;

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed."));
  });
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("Transaction failed."));
    transaction.onabort = () => reject(transaction.error ?? new Error("Transaction aborted."));
  });
}

function ensureIndexes(store: IDBObjectStore) {
  if (!store.indexNames.contains(INDEX_BY_NAME)) {
    store.createIndex(INDEX_BY_NAME, "name", { unique: false });
  }

  if (!store.indexNames.contains(INDEX_BY_CATEGORY)) {
    store.createIndex(INDEX_BY_CATEGORY, "category", { unique: false });
  }

  if (!store.indexNames.contains(INDEX_BY_CREATED_AT)) {
    store.createIndex(INDEX_BY_CREATED_AT, "createdAt", { unique: false });
  }
}

function normalizeStoredItem(value: Item | Partial<Item>): Item {
  return {
    id: value.id,
    name: value.name ?? "",
    category: value.category ?? "personal",
    createdAt: value.createdAt ?? Date.now(),
  };
}

function collectCursorValues<T>(request: IDBRequest<IDBCursorWithValue | null>): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const values: T[] = [];

    request.onsuccess = () => {
      const cursor = request.result;

      if (!cursor) {
        resolve(values);
        return;
      }

      values.push(cursor.value as T);
      cursor.continue();
    };

    request.onerror = () => reject(request.error ?? new Error("Cursor iteration failed."));
  });
}

function clampNonNegative(value: number | undefined, fallback: number): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return fallback;
  }

  return Math.max(0, Math.trunc(value));
}

export function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;
      const store = database.objectStoreNames.contains(STORE_NAME)
        ? request.transaction!.objectStore(STORE_NAME)
        : database.createObjectStore(STORE_NAME, {
            keyPath: "id",
            autoIncrement: true,
          });

      ensureIndexes(store);
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Could not open IndexedDB."));
  });
}

export async function listItems(database: IDBDatabase): Promise<Item[]> {
  const transaction = database.transaction(STORE_NAME, "readonly");
  const store = transaction.objectStore(STORE_NAME);
  const items = await requestToPromise(store.getAll());
  await transactionDone(transaction);
  return items.map(normalizeStoredItem).sort((left, right) => right.createdAt - left.createdAt);
}

export async function getItemById(database: IDBDatabase, id: number): Promise<Item | undefined> {
  const transaction = database.transaction(STORE_NAME, "readonly");
  const store = transaction.objectStore(STORE_NAME);
  const item = await requestToPromise(store.get(id));
  await transactionDone(transaction);
  return item ? normalizeStoredItem(item) : undefined;
}

export async function getItemsByExactName(database: IDBDatabase, name: string): Promise<Item[]> {
  const transaction = database.transaction(STORE_NAME, "readonly");
  const store = transaction.objectStore(STORE_NAME);
  const index = store.index(INDEX_BY_NAME);
  const items = await collectCursorValues<Item>(index.openCursor(IDBKeyRange.only(name)));
  await transactionDone(transaction);
  return items.map(normalizeStoredItem);
}

export async function getFirstItemByCategory(database: IDBDatabase, category: ItemCategory): Promise<Item | undefined> {
  const transaction = database.transaction(STORE_NAME, "readonly");
  const store = transaction.objectStore(STORE_NAME);
  const index = store.index(INDEX_BY_CATEGORY);
  const item = await requestToPromise(index.get(category));
  await transactionDone(transaction);
  return item ? normalizeStoredItem(item) : undefined;
}

export async function getItemsCreatedAtOnly(database: IDBDatabase, createdAt: number): Promise<Item[]> {
  const transaction = database.transaction(STORE_NAME, "readonly");
  const store = transaction.objectStore(STORE_NAME);
  const index = store.index(INDEX_BY_CREATED_AT);
  const items = await collectCursorValues<Item>(index.openCursor(IDBKeyRange.only(createdAt)));
  await transactionDone(transaction);
  return items.map(normalizeStoredItem);
}

export async function getItemsCreatedAfter(database: IDBDatabase, createdAt: number): Promise<Item[]> {
  const transaction = database.transaction(STORE_NAME, "readonly");
  const store = transaction.objectStore(STORE_NAME);
  const index = store.index(INDEX_BY_CREATED_AT);
  const items = await collectCursorValues<Item>(index.openCursor(IDBKeyRange.lowerBound(createdAt)));
  await transactionDone(transaction);
  return items.map(normalizeStoredItem);
}

export async function getItemsCreatedBefore(database: IDBDatabase, createdAt: number): Promise<Item[]> {
  const transaction = database.transaction(STORE_NAME, "readonly");
  const store = transaction.objectStore(STORE_NAME);
  const index = store.index(INDEX_BY_CREATED_AT);
  const items = await collectCursorValues<Item>(index.openCursor(IDBKeyRange.upperBound(createdAt)));
  await transactionDone(transaction);
  return items.map(normalizeStoredItem);
}

export async function getItemsCreatedBetween(
  database: IDBDatabase,
  start: number,
  end: number,
): Promise<Item[]> {
  const transaction = database.transaction(STORE_NAME, "readonly");
  const store = transaction.objectStore(STORE_NAME);
  const index = store.index(INDEX_BY_CREATED_AT);
  const items = await collectCursorValues<Item>(index.openCursor(IDBKeyRange.bound(start, end)));
  await transactionDone(transaction);
  return items.map(normalizeStoredItem);
}

export async function searchItemsWithCursor(
  database: IDBDatabase,
  input: CursorSearchInput = {},
): Promise<Item[]> {
  const category = input.category ?? "all";
  const direction = input.direction ?? "next";
  const offset = clampNonNegative(input.offset, 0);
  const limit = clampNonNegative(input.limit, DEFAULT_CURSOR_LIMIT);

  const transaction = database.transaction(STORE_NAME, "readonly");
  const store = transaction.objectStore(STORE_NAME);
  const source: IDBObjectStore | IDBIndex = category === "all" ? store : store.index(INDEX_BY_CATEGORY);
  const range = category === "all" ? null : IDBKeyRange.only(category);

  const items = await new Promise<Item[]>((resolve, reject) => {
    const results: Item[] = [];
    let skipped = 0;
    const request = source.openCursor(range, direction);

    request.onsuccess = () => {
      const cursor = request.result;

      if (!cursor || results.length >= limit) {
        resolve(results);
        return;
      }

      if (skipped < offset) {
        skipped += 1;
        cursor.continue();
        return;
      }

      results.push(normalizeStoredItem(cursor.value as Item));
      cursor.continue();
    };

    request.onerror = () => reject(request.error ?? new Error("Cursor search failed."));
  });

  await transactionDone(transaction);
  return items;
}

export async function createItem(
  database: IDBDatabase,
  input: Pick<Item, "name" | "category">,
): Promise<void> {
  const transaction = database.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);
  await requestToPromise(
    store.add({
      name: input.name,
      category: input.category,
      createdAt: Date.now(),
    } satisfies Omit<Item, "id">),
  );
  await transactionDone(transaction);
}

export async function updateItem(database: IDBDatabase, item: Item): Promise<void> {
  const transaction = database.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);
  const current = normalizeStoredItem(item);
  await requestToPromise(store.put(current));
  await transactionDone(transaction);
}

export async function deleteItem(database: IDBDatabase, id: number): Promise<void> {
  const transaction = database.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);
  await requestToPromise(store.delete(id));
  await transactionDone(transaction);
}
