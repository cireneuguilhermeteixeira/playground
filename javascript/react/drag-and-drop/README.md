# Native Drag and Drop POC

This project is a small React + TypeScript proof of concept using the browser-native Drag and Drop API.

It intentionally avoids drag-and-drop libraries so the core browser concepts are easier to see.

## Running the project

```bash
npm install
npm run dev
```

## What the example does

The UI renders a simple board with three columns:

- Backlog
- Doing
- Done

Each task card is draggable. Dropping a card on another column updates local React state and moves the card to that column.

There is no persistence layer in this POC. Refreshing the page resets the cards to the initial state.

## Native APIs used

### `draggable`

`draggable` is a native HTML attribute.

In this project, each task card has:

```tsx
<div draggable>
  ...
</div>
```

That tells the browser the element can start a drag operation.

### `dragstart`

`dragstart` runs when the user begins dragging an element.

This project uses it to:

- mark the current task as being dragged
- store a small payload in `DataTransfer`
- tell the browser the operation is a move

```ts
event.dataTransfer.effectAllowed = "move";
event.dataTransfer.setData(DATA_TRANSFER_TYPE, JSON.stringify(payload));
```

### `DataTransfer`

`DataTransfer` is the browser object attached to drag events.

It carries data from the dragged element to the drop target.

This POC stores a JSON payload with:

- `taskId`
- `sourceColumnId`

The custom MIME-like type is:

```ts
const DATA_TRANSFER_TYPE = "application/x-native-dnd-task";
```

Using a custom type makes the payload more explicit than a generic `"text/plain"` value.

### `dragover`

`dragover` fires repeatedly while the dragged item is over a possible drop target.

By default, many elements do not accept drops. Calling `event.preventDefault()` inside `dragover` is what allows the later `drop` event to run.

```ts
function handleDragOver(event: DragEvent<HTMLElement>) {
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
}
```

### `drop`

`drop` runs when the user releases the dragged item over a valid drop target.

This project reads the payload from `DataTransfer`, finds the matching task, and updates its `columnId` in React state.

```ts
const payload = parseDragPayload(event);
```

### `dragenter` and `dragleave`

`dragenter` and `dragleave` are used for visual feedback.

When a dragged card enters a column, the column gets an active style. When it leaves, the active style is cleared.

### `dragend`

`dragend` runs after the drag operation finishes, whether it ended with a successful drop or was cancelled.

This project uses it to clear temporary UI state:

```ts
setActiveColumnId(null);
setDraggedTaskId(null);
```

## How the state works

Tasks are stored as a flat array:

```ts
type Task = {
  id: string;
  title: string;
  description: string;
  columnId: ColumnId;
};
```

Moving a task only changes its `columnId`.

The UI groups tasks by column with `useMemo`, then renders each column from that grouped data.

## Limitations of this first version

This POC is intentionally small.

It does not include:

- sorting cards inside the same column
- touch-first mobile drag behavior
- keyboard-accessible drag controls
- persistence in local storage or a backend
- nested drop zones

Those features are useful next steps, but leaving them out keeps the native API flow easier to understand.
