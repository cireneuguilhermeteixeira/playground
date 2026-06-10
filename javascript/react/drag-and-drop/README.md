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

## Drag event reference

React uses camelCase handler names, but they map directly to native browser drag events.

For example:

- `onDragStart` maps to the native `dragstart` event
- `onDragOver` maps to the native `dragover` event
- `onDrop` maps to the native `drop` event

### `onDragStart`

`onDragStart` runs once when the user starts dragging a draggable element.

Use it to prepare the drag operation.

Common responsibilities:

- save the dragged item id in `event.dataTransfer`
- set `event.dataTransfer.effectAllowed`
- update UI state, such as marking the dragged card as active

In this POC, `onDragStart` stores a JSON payload with the task id and source column id.

### `onDrag`

`onDrag` runs repeatedly while the element is being dragged.

It is useful when you need continuous feedback during the drag, such as tracking approximate pointer movement or updating a custom UI.

This POC does not use `onDrag` because the browser already handles the drag preview and the app only needs to react when the card enters, leaves, or drops on a column.

### `onDragEnter`

`onDragEnter` runs when the dragged item enters an element or one of its child elements.

Use it for target feedback, such as highlighting a column that may accept the drop.

In this POC, `onDragEnter` stores the current column id as the active column.

Important detail: this event can fire more often than expected when moving across child elements inside the same drop zone.

### `onDragLeave`

`onDragLeave` runs when the dragged item leaves an element or one of its child elements.

Use it to remove target feedback that was added by `onDragEnter`.

In this POC, `onDragLeave` clears the active column.

Important detail: like `onDragEnter`, this event can be noisy with nested elements. A more advanced implementation may track enter and leave depth or check whether the pointer truly left the drop zone.

### `onDragOver`

`onDragOver` runs repeatedly while the dragged item is over a possible drop target.

This is one of the most important drag-and-drop events because a drop target must usually call:

```ts
event.preventDefault();
```

Without that call, the browser may not allow the element to receive the later `drop` event.

Use `onDragOver` to:

- allow dropping on an element
- set `event.dataTransfer.dropEffect`
- update target feedback while the pointer remains over the target

In this POC, `onDragOver` allows dropping and tells the browser the operation is a move.

### `onDrop`

`onDrop` runs when the user releases the dragged item over a valid drop target.

Use it to complete the operation.

Common responsibilities:

- call `event.preventDefault()`
- read data from `event.dataTransfer`
- validate the payload
- update application state
- clear temporary drag UI state

In this POC, `onDrop` reads the task id from `DataTransfer` and changes that task's `columnId`.

### `onDragEnd`

`onDragEnd` runs once when the drag operation finishes.

It runs after a successful drop and also after a cancelled drag.

Use it for cleanup that must always happen, such as:

- clearing the dragged item id
- removing active drop target styles
- resetting temporary UI state

In this POC, `onDragEnd` clears `activeColumnId` and `draggedTaskId`.

### Other related events

The native Drag and Drop API also has a few related pieces worth knowing.

### `onDragExit`

`dragexit` exists in the HTML Drag and Drop API, but it is not commonly used in React apps and browser behavior has historically been less consistent than `dragenter` and `dragleave`.

For most UI work, prefer `onDragEnter` and `onDragLeave`.

### `onMouseDown`, `onPointerDown`, and touch events

These are not drag-and-drop events.

They are pointer input events that can be used to build custom drag behavior from scratch.

Libraries often use pointer events instead of the native Drag and Drop API because pointer events provide more control and work better for touch-first interfaces.

This POC does not use them because the goal is to demonstrate the native browser drag-and-drop flow.

### `DataTransfer.setDragImage()`

`setDragImage()` is not an event, but it is part of the drag API.

It lets you replace the default drag preview image shown by the browser.

Example:

```ts
event.dataTransfer.setDragImage(customElement, 12, 12);
```

This POC keeps the default browser drag preview to avoid extra moving parts.

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
