export type TaskStatus = "todo" | "done";

export type TaskRecord = {
  id?: number;
  title: string;
  status: TaskStatus;
  category: string;
  createdAt: number;
};

export type AssetRecord = {
  id?: number;
  name: string;
  type: string;
  size: number;
  createdAt: number;
  blob: Blob;
};

const DB_NAME = "indexeddb-react-poc";
const DB_VERSION = 1;
const TASK_STORE = "tasks";
const ASSET_STORE = "assets";
const STATUS_INDEX = "by_status";

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

export async function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(TASK_STORE)) {
        const tasks = database.createObjectStore(TASK_STORE, {
          keyPath: "id",
          autoIncrement: true,
        });
        tasks.createIndex(STATUS_INDEX, "status", { unique: false });
      }

      if (!database.objectStoreNames.contains(ASSET_STORE)) {
        database.createObjectStore(ASSET_STORE, {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Could not open IndexedDB."));
  });
}

export async function addTask(database: IDBDatabase, task: Omit<TaskRecord, "id">): Promise<number> {
  const transaction = database.transaction(TASK_STORE, "readwrite");
  const store = transaction.objectStore(TASK_STORE);
  const key = await requestToPromise(store.add(task));
  await transactionDone(transaction);

  if (typeof key !== "number") {
    throw new Error("Expected a numeric task key.");
  }

  return key;
}

export async function getAllTasks(database: IDBDatabase): Promise<TaskRecord[]> {
  const transaction = database.transaction(TASK_STORE, "readonly");
  const store = transaction.objectStore(TASK_STORE);
  const result = await requestToPromise(store.getAll());
  await transactionDone(transaction);
  return result;
}

export async function getTasksByStatus(database: IDBDatabase, status: TaskStatus): Promise<TaskRecord[]> {
  const transaction = database.transaction(TASK_STORE, "readonly");
  const store = transaction.objectStore(TASK_STORE);
  const index = store.index(STATUS_INDEX);
  const result = await requestToPromise(index.getAll(status));
  await transactionDone(transaction);
  return result;
}

export async function updateTask(database: IDBDatabase, task: TaskRecord): Promise<void> {
  const transaction = database.transaction(TASK_STORE, "readwrite");
  const store = transaction.objectStore(TASK_STORE);
  await requestToPromise(store.put(task));
  await transactionDone(transaction);
}

export async function deleteTask(database: IDBDatabase, id: number): Promise<void> {
  const transaction = database.transaction(TASK_STORE, "readwrite");
  const store = transaction.objectStore(TASK_STORE);
  await requestToPromise(store.delete(id));
  await transactionDone(transaction);
}

export async function clearTasks(database: IDBDatabase): Promise<void> {
  const transaction = database.transaction(TASK_STORE, "readwrite");
  const store = transaction.objectStore(TASK_STORE);
  await requestToPromise(store.clear());
  await transactionDone(transaction);
}

export async function addAsset(database: IDBDatabase, file: File): Promise<number> {
  const transaction = database.transaction(ASSET_STORE, "readwrite");
  const store = transaction.objectStore(ASSET_STORE);
  const key = await requestToPromise(
    store.add({
      name: file.name,
      type: file.type || "application/octet-stream",
      size: file.size,
      createdAt: Date.now(),
      blob: file,
    } satisfies Omit<AssetRecord, "id">),
  );
  await transactionDone(transaction);

  if (typeof key !== "number") {
    throw new Error("Expected a numeric asset key.");
  }

  return key;
}

export async function getAllAssets(database: IDBDatabase): Promise<AssetRecord[]> {
  const transaction = database.transaction(ASSET_STORE, "readonly");
  const store = transaction.objectStore(ASSET_STORE);
  const result = await requestToPromise(store.getAll());
  await transactionDone(transaction);
  return result;
}

export async function clearAssets(database: IDBDatabase): Promise<void> {
  const transaction = database.transaction(ASSET_STORE, "readwrite");
  const store = transaction.objectStore(ASSET_STORE);
  await requestToPromise(store.clear());
  await transactionDone(transaction);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
