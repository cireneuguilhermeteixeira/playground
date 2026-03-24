import { FormEvent, useEffect, useState } from "react";
import { createItem, deleteItem, Item, listItems, openDatabase, updateItem } from "./db";

export default function App() {
  const [database, setDatabase] = useState<IDBDatabase | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [status, setStatus] = useState("Opening database...");
  const [isOnline, setIsOnline] = useState(navigator.onLine);

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
        setStatus("Database ready.");
        await refreshItems(db);
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Could not open database.");
      }
    })();
  }, []);

  async function refreshItems(db: IDBDatabase) {
    const nextItems = await listItems(db);
    setItems(nextItems);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!database) return;
    if (!name.trim()) return;

    if (editingId === null) {
      await createItem(database, name.trim());
      setStatus("Item created.");
    } else {
      await updateItem(database, { id: editingId, name: name.trim() });
      setStatus("Item updated.");
      setEditingId(null);
    }

    setName("");
    await refreshItems(database);
  }

  async function handleDelete(id: number) {
    if (!database) return;
    await deleteItem(database, id);
    setStatus("Item deleted.");
    if (editingId === id) {
      setEditingId(null);
      setName("");
    }
    await refreshItems(database);
  }

  function handleEdit(item: Item) {
    setEditingId(item.id ?? null);
    setName(item.name);
    setStatus(`Editing item ${item.id}.`);
  }

  return (
    <main>
      <h1>Simple IndexedDB CRUD</h1>
      <p>Status: {status}</p>
      <p>Connection: {isOnline ? "online" : "offline"}</p>
      <p>
        If this page is already open, the CRUD below keeps working offline because the data is stored in IndexedDB.
      </p>

      <form onSubmit={(event) => void handleSubmit(event)}>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Type a name"
        />
        <button type="submit">{editingId === null ? "Create" : "Update"}</button>
        <button
          type="button"
          onClick={() => {
            setEditingId(null);
            setName("");
            setStatus("Form cleared.");
          }}
        >
          Cancel
        </button>
      </form>

      <ul>
        {items.map((item) => (
          <li key={item.id}>
            {item.id} - {item.name}{" "}
            <button type="button" onClick={() => handleEdit(item)}>
              Edit
            </button>{" "}
            <button type="button" onClick={() => void handleDelete(item.id!)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
