import { startTransition, useEffect, useMemo, useState } from "react";
import {
  addAsset,
  addTask,
  AssetRecord,
  clearAssets,
  clearTasks,
  deleteTask,
  formatBytes,
  getAllAssets,
  getAllTasks,
  getTasksByStatus,
  openDatabase,
  TaskRecord,
  TaskStatus,
  updateTask,
} from "./db";

type Filter = "all" | TaskStatus;

type LogEntry = {
  id: number;
  message: string;
};

const seedTasks = [
  {
    title: "Read the IndexedDB mental model",
    status: "todo" as const,
    category: "learning",
    createdAt: Date.now() - 1000 * 60 * 60,
  },
  {
    title: "Persist a task with add()",
    status: "todo" as const,
    category: "basic CRUD",
    createdAt: Date.now() - 1000 * 60 * 35,
  },
  {
    title: "Filter tasks through an index",
    status: "done" as const,
    category: "indexes",
    createdAt: Date.now() - 1000 * 60 * 5,
  },
];

const randomTitles = [
  "Cache API responses locally",
  "Save offline image drafts",
  "Queue uploads while offline",
  "Build a local-first gallery",
  "Inspect blobs in DevTools",
];

export default function App() {
  const [database, setDatabase] = useState<IDBDatabase | null>(null);
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [assets, setAssets] = useState<AssetRecord[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [busy, setBusy] = useState(false);
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const db = await openDatabase();
        if (!active) return;
        setDatabase(db);
        await refreshAll(db, filter);
        pushLog("Database opened successfully. Stores: tasks and assets.");
      } catch (caughtError) {
        const message = caughtError instanceof Error ? caughtError.message : "Unknown IndexedDB error.";
        if (!active) return;
        setError(message);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  async function refreshAll(db: IDBDatabase, nextFilter: Filter): Promise<void> {
    const nextTasks = nextFilter === "all" ? await getAllTasks(db) : await getTasksByStatus(db, nextFilter);
    const allTasks = await getAllTasks(db);
    const nextAssets = await getAllAssets(db);

    startTransition(() => {
      setTasks(nextFilter === "all" ? allTasks : nextTasks);
      setAssets(nextAssets);
    });
  }

  function pushLog(message: string): void {
    const entry: LogEntry = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      message: `${new Date().toLocaleTimeString("en-US")} ${message}`,
    };

    setLogEntries((current) => [entry, ...current].slice(0, 8));
  }

  async function runAction(action: () => Promise<void>): Promise<void> {
    if (!database) return;

    setBusy(true);
    setError(null);

    try {
      await action();
      await refreshAll(database, filter);
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Unknown action failure.";
      setError(message);
      pushLog(`Error: ${message}`);
    } finally {
      setBusy(false);
    }
  }

  async function handleSeedTasks(): Promise<void> {
    if (!database) return;
    await runAction(async () => {
      for (const task of seedTasks) {
        await addTask(database, task);
      }
      pushLog("Inserted sample task records with add() inside readwrite transactions.");
    });
  }

  async function handleAddRandomTask(): Promise<void> {
    if (!database) return;
    await runAction(async () => {
      const title = randomTitles[Math.floor(Math.random() * randomTitles.length)];
      const taskId = await addTask(database, {
        title,
        status: Math.random() > 0.5 ? "todo" : "done",
        category: "random example",
        createdAt: Date.now(),
      });
      pushLog(`Inserted task ${taskId} using add().`);
    });
  }

  async function handleMarkFirstTodo(): Promise<void> {
    if (!database) return;
    await runAction(async () => {
      const todoTasks = await getTasksByStatus(database, "todo");
      const firstTodo = todoTasks[0];

      if (!firstTodo) {
        pushLog("No todo task was available to update.");
        return;
      }

      await updateTask(database, { ...firstTodo, status: "done" });
      pushLog(`Updated task ${firstTodo.id} with put().`);
    });
  }

  async function handleDeleteDone(): Promise<void> {
    if (!database) return;
    await runAction(async () => {
      const doneTasks = await getTasksByStatus(database, "done");
      for (const task of doneTasks) {
        if (typeof task.id === "number") {
          await deleteTask(database, task.id);
        }
      }
      pushLog(`Deleted ${doneTasks.length} done task(s) using delete().`);
    });
  }

  async function handleTaskFilter(nextFilter: Filter): Promise<void> {
    if (!database) return;
    setFilter(nextFilter);
    setBusy(true);

    try {
      await refreshAll(database, nextFilter);
      pushLog(nextFilter === "all" ? "Loaded all tasks with getAll()." : `Loaded ${nextFilter} tasks through the status index.`);
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Unknown filter failure.";
      setError(message);
      pushLog(`Error: ${message}`);
    } finally {
      setBusy(false);
    }
  }

  async function handleClearTasks(): Promise<void> {
    if (!database) return;
    await runAction(async () => {
      await clearTasks(database);
      pushLog("Cleared the tasks object store.");
    });
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    if (!database) return;
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    await runAction(async () => {
      for (const file of files) {
        await addAsset(database, file);
      }
      pushLog(`Stored ${files.length} file(s) as Blob values in IndexedDB.`);
    });

    event.target.value = "";
  }

  async function handleClearAssets(): Promise<void> {
    if (!database) return;
    await runAction(async () => {
      await clearAssets(database);
      pushLog("Cleared the assets object store.");
    });
  }

  const taskStats = useMemo(() => {
    const todo = tasks.filter((task) => task.status === "todo").length;
    const done = tasks.filter((task) => task.status === "done").length;
    return {
      total: tasks.length,
      todo,
      done,
    };
  }, [tasks]);

  const assetBytes = useMemo(
    () => assets.reduce((total, asset) => total + asset.size, 0),
    [assets],
  );

  return (
    <div className="page-shell">
      <header className="hero">
        <p className="eyebrow">IndexedDB React POC</p>
        <h1>Learn IndexedDB with React state, effects, and Blob storage</h1>
        <p className="lead">
          This proof of concept uses React to drive IndexedDB reads and writes, including
          a real example for storing images or large files as Blob values.
        </p>
      </header>

      <main className="layout">
        <section className="panel prose-panel">
          <h2>What IndexedDB is</h2>
          <p>
            IndexedDB is the browser&apos;s built-in database for structured, persistent,
            asynchronous client-side data. It is a strong fit for offline apps, local caches,
            drafts, queues, and media storage.
          </p>

          <div className="callout">
            <strong>Why this React version matters:</strong> React handles UI state and rendering,
            while IndexedDB persists the data behind that UI.
          </div>

          <h3>Core concepts</h3>
          <ul>
            <li><strong>Database:</strong> top-level container identified by a name and version.</li>
            <li><strong>Object store:</strong> a collection of records, similar to a table.</li>
            <li><strong>Index:</strong> a fast lookup path for non-primary-key fields.</li>
            <li><strong>Transaction:</strong> the safe boundary for reads and writes.</li>
            <li><strong>Blob:</strong> binary data like images, PDFs, videos, and large files.</li>
          </ul>

          <h3>What you need to know</h3>
          <ul>
            <li>Use IndexedDB instead of <code>localStorage</code> when data is large or structured.</li>
            <li>Schema changes happen only through database version upgrades.</li>
            <li>Most teams wrap the event API with Promises to simplify async code.</li>
            <li>Blobs can be stored directly, which is useful for media-heavy offline experiences.</li>
          </ul>

          <h3>Basic example</h3>
          <pre><code>{`const request = indexedDB.open("app-db", 1);
request.onupgradeneeded = () => {
  const db = request.result;
  db.createObjectStore("files", { keyPath: "id", autoIncrement: true });
};`}</code></pre>

          <h3>Intermediate example</h3>
          <pre><code>{`const tx = db.transaction("files", "readwrite");
const store = tx.objectStore("files");
await store.add({ name: file.name, blob: file });`}</code></pre>
        </section>

        <section className="panel demo-panel">
          <div className="demo-header">
            <div>
              <p className="eyebrow">Live demo</p>
              <h2>Tasks + assets</h2>
            </div>
            <div className="badge">{error ? "Database error" : database ? "Database ready" : "Opening database..."}</div>
          </div>

          <p className="demo-copy">
            The task area shows CRUD and indexed queries. The asset area stores files as Blobs,
            which is the common path for images, PDFs, videos, and other larger payloads.
          </p>

          {error ? <div className="error-box">{error}</div> : null}

          <section className="subpanel">
            <div className="section-heading">
              <h3>Task store</h3>
              <span>{busy ? "Working..." : `${filter.toUpperCase()} view`}</span>
            </div>

            <div className="controls">
              <button onClick={() => void handleSeedTasks()} disabled={!database || busy}>Seed sample tasks</button>
              <button onClick={() => void handleAddRandomTask()} disabled={!database || busy}>Add random task</button>
              <button onClick={() => void handleMarkFirstTodo()} disabled={!database || busy}>Mark first todo as done</button>
              <button onClick={() => void handleDeleteDone()} disabled={!database || busy}>Delete done tasks</button>
              <button className="danger" onClick={() => void handleClearTasks()} disabled={!database || busy}>Clear tasks</button>
            </div>

            <div className="filters">
              {(["all", "todo", "done"] as const).map((value) => (
                <button
                  key={value}
                  className={value === filter ? "filter is-active" : "filter"}
                  onClick={() => void handleTaskFilter(value)}
                  disabled={!database || busy}
                >
                  {value}
                </button>
              ))}
            </div>

            <div className="stats">
              <div className="stat-card"><span className="stat-label">Visible</span><strong>{taskStats.total}</strong></div>
              <div className="stat-card"><span className="stat-label">Todo</span><strong>{taskStats.todo}</strong></div>
              <div className="stat-card"><span className="stat-label">Done</span><strong>{taskStats.done}</strong></div>
            </div>

            <div className="task-list">
              {tasks.length === 0 ? (
                <div className="empty-state">
                  <strong>No tasks in the current view.</strong>
                  <p>Seed the store or add a random task to see the object store update React state.</p>
                </div>
              ) : (
                tasks
                  .slice()
                  .sort((a, b) => b.createdAt - a.createdAt)
                  .map((task) => (
                    <article className="task-card" key={task.id}>
                      <div className="task-row">
                        <span className={`task-status ${task.status}`}>{task.status}</span>
                        <span className="task-category">{task.category}</span>
                      </div>
                      <h3>{task.title}</h3>
                      <p>Record id: {task.id} | Created: {new Date(task.createdAt).toLocaleString("en-US")}</p>
                    </article>
                  ))
              )}
            </div>
          </section>

          <section className="subpanel">
            <div className="section-heading">
              <h3>Asset store</h3>
              <span>{assets.length} file(s) | {formatBytes(assetBytes)}</span>
            </div>

            <label className="upload-box">
              <input type="file" multiple onChange={(event) => void handleFileChange(event)} disabled={!database || busy} />
              <strong>Choose images or files</strong>
              <p>Each selected file is stored in IndexedDB as a Blob. Images get a live preview.</p>
            </label>

            <div className="controls single-action">
              <button className="danger" onClick={() => void handleClearAssets()} disabled={!database || busy}>Clear assets</button>
            </div>

            <div className="asset-grid">
              {assets.length === 0 ? (
                <div className="empty-state">
                  <strong>No files stored yet.</strong>
                  <p>Upload an image, PDF, or other file to persist it in IndexedDB.</p>
                </div>
              ) : (
                assets
                  .slice()
                  .sort((a, b) => b.createdAt - a.createdAt)
                  .map((asset) => <AssetCard asset={asset} key={asset.id} />)
              )}
            </div>
          </section>

          <section className="notes">
            <h3>React features used here</h3>
            <ul>
              <li><strong>useEffect:</strong> opens the database when the app mounts.</li>
              <li><strong>useState:</strong> stores tasks, assets, logs, loading state, and errors.</li>
              <li><strong>startTransition:</strong> keeps list updates non-urgent when refreshing data.</li>
              <li><strong>component rendering:</strong> the UI reacts automatically after IndexedDB operations.</li>
            </ul>
          </section>

          <section className="notes">
            <h3>Recent log</h3>
            <div className="log-box">
              {logEntries.length === 0 ? <div>No operations yet.</div> : logEntries.map((entry) => <div key={entry.id}>{entry.message}</div>)}
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}

function AssetCard({ asset }: { asset: AssetRecord }) {
  const previewUrl = useMemo(() => URL.createObjectURL(asset.blob), [asset.blob]);
  const isImage = asset.type.startsWith("image/");

  useEffect(() => () => URL.revokeObjectURL(previewUrl), [previewUrl]);

  return (
    <article className="asset-card">
      {isImage ? <img className="asset-preview" src={previewUrl} alt={asset.name} /> : <div className="file-pill">{asset.type || "file"}</div>}
      <h3>{asset.name}</h3>
      <p>{formatBytes(asset.size)} | {new Date(asset.createdAt).toLocaleString("en-US")}</p>
      <a href={previewUrl} download={asset.name}>Download blob</a>
    </article>
  );
}
