import { DragEvent, useMemo, useState } from "react";

type ColumnId = "backlog" | "doing" | "done";

type Task = {
  id: string;
  title: string;
  description: string;
  columnId: ColumnId;
};

type DragPayload = {
  taskId: string;
  sourceColumnId: ColumnId;
};

const DATA_TRANSFER_TYPE = "application/x-native-dnd-task";

const columns: Array<{ id: ColumnId; title: string }> = [
  { id: "backlog", title: "Backlog" },
  { id: "doing", title: "Doing" },
  { id: "done", title: "Done" },
];

const initialTasks: Task[] = [
  {
    id: "task-1",
    title: "Read the native API",
    description: "Start with draggable, dragstart, dragover, and drop.",
    columnId: "backlog",
  },
  {
    id: "task-2",
    title: "Move a card",
    description: "Use DataTransfer to carry the task id during the drag.",
    columnId: "backlog",
  },
  {
    id: "task-3",
    title: "Highlight the target",
    description: "Use dragenter and dragleave to show the active drop zone.",
    columnId: "doing",
  },
];

function parseDragPayload(event: DragEvent<HTMLElement>): DragPayload | null {
  const rawPayload = event.dataTransfer.getData(DATA_TRANSFER_TYPE);

  if (!rawPayload) {
    return null;
  }

  try {
    return JSON.parse(rawPayload) as DragPayload;
  } catch {
    return null;
  }
}

export default function App() {
  const [tasks, setTasks] = useState(initialTasks);
  const [activeColumnId, setActiveColumnId] = useState<ColumnId | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const tasksByColumn = useMemo(() => {
    return columns.reduce<Record<ColumnId, Task[]>>(
      (accumulator, column) => {
        accumulator[column.id] = tasks.filter((task) => task.columnId === column.id);
        return accumulator;
      },
      { backlog: [], doing: [], done: [] },
    );
  }, [tasks]);

  function handleDragStart(event: DragEvent<HTMLElement>, task: Task) {
    const payload: DragPayload = {
      taskId: task.id,
      sourceColumnId: task.columnId,
    };

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData(DATA_TRANSFER_TYPE, JSON.stringify(payload));
    setDraggedTaskId(task.id);
  }

  function handleDragOver(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }

  function handleDrop(event: DragEvent<HTMLElement>, targetColumnId: ColumnId) {
    event.preventDefault();

    const payload = parseDragPayload(event);

    if (!payload) {
      setActiveColumnId(null);
      setDraggedTaskId(null);
      return;
    }

    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === payload.taskId ? { ...task, columnId: targetColumnId } : task,
      ),
    );
    setActiveColumnId(null);
    setDraggedTaskId(null);
  }

  function handleDragEnd() {
    setActiveColumnId(null);
    setDraggedTaskId(null);
  }

  return (
    <main className="page-shell">
      <section className="intro">
        <p className="eyebrow">Browser-native API</p>
        <h1>Native Drag and Drop POC</h1>
        <p>
          A small React example using the browser Drag and Drop API directly. Drag cards
          between columns to see the event flow.
        </p>
      </section>

      <section className="board" aria-label="Task board">
        {columns.map((column) => {
          const columnTasks = tasksByColumn[column.id];
          const isActive = activeColumnId === column.id;

          return (
            <article
              className={isActive ? "column column-active" : "column"}
              key={column.id}
              onDragEnter={() => setActiveColumnId(column.id)}
              onDragLeave={() => setActiveColumnId(null)}
              onDragOver={handleDragOver}
              onDrop={(event) => handleDrop(event, column.id)}
            >
              <header className="column-header">
                <h2>{column.title}</h2>
                <span>{columnTasks.length}</span>
              </header>

              <div className="task-list">
                {columnTasks.map((task) => (
                  <div
                    className={draggedTaskId === task.id ? "task-card task-card-dragging" : "task-card"}
                    draggable
                    key={task.id}
                    onDragEnd={handleDragEnd}
                    onDragStart={(event) => handleDragStart(event, task)}
                  >
                    <h3>{task.title}</h3>
                    <p>{task.description}</p>
                  </div>
                ))}

                {columnTasks.length === 0 && <p className="empty-state">Drop a card here.</p>}
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
