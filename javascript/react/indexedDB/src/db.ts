export type Item = {
  id?: number;
  name: string;
};

const DB_NAME = "simple-crud-db";
const DB_VERSION = 1;
const STORE_NAME = "items";

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

export function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
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

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Could not open IndexedDB."));
  });
}

export async function listItems(database: IDBDatabase): Promise<Item[]> {
  const transaction = database.transaction(STORE_NAME, "readonly");
  const store = transaction.objectStore(STORE_NAME);
  const items = await requestToPromise(store.getAll());
  await transactionDone(transaction);
  return items;
}

export async function createItem(database: IDBDatabase, name: string): Promise<void> {
  const transaction = database.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);
  await requestToPromise(store.add({ name } satisfies Omit<Item, "id">));
  await transactionDone(transaction);
}

export async function updateItem(database: IDBDatabase, item: Item): Promise<void> {
  const transaction = database.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);
  await requestToPromise(store.put(item));
  await transactionDone(transaction);
}

export async function deleteItem(database: IDBDatabase, id: number): Promise<void> {
  const transaction = database.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);
  await requestToPromise(store.delete(id));
  await transactionDone(transaction);
}
