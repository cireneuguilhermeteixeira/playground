# Intersection And Mutation Observer POC

This project is a small React + TypeScript proof of concept for two browser observer APIs:

- `IntersectionObserver`
- `MutationObserver`

## Running the project

```bash
npm install
npm run dev
```

## What the example does

- Renders a list of tall sections so scrolling is required
- Observes each section with a single `IntersectionObserver`
- Updates React state when a section becomes visible
- Highlights both the section card and a small status panel
- Observes a small DOM feed with `MutationObserver`
- Logs when feed nodes are added or removed

## Native API used

### `IntersectionObserver`

`IntersectionObserver` lets the browser notify your code when a target element intersects a root area, usually the viewport.

In this project, one observer instance watches all sections:

```ts
const observer = new IntersectionObserver(callback, {
  threshold: 0.5,
});
```

The threshold means the callback reacts when about half of a section is visible.

### `entry.isIntersecting`

Each observer callback receives `IntersectionObserverEntry` objects.

This project uses `entry.isIntersecting` to decide whether a section should be marked as visible in React state.

### `observer.observe`

Each section element is registered with:

```ts
observer.observe(element);
```

### `observer.disconnect`

The effect cleanup disconnects the observer when the component unmounts:

```ts
observer.disconnect();
```

## Mutation Observer API used

### `MutationObserver`

`MutationObserver` watches DOM changes after the initial render.

In this project, the observer watches a feed container:

```ts
observer.observe(feedElement, {
  childList: true,
});
```

That means the callback runs when direct child nodes are added or removed.

### `MutationRecord`

The callback receives `MutationRecord` entries.

This project reads:

- `record.type`
- `record.addedNodes`
- `record.removedNodes`

Those records are converted into a small UI log so it is easy to see when the DOM changed.

## Next steps

This starter can be extended later for:

- lazy loading images
- scroll-triggered animations
- analytics for viewed sections
- active table-of-contents tracking
- reacting to attribute changes
- reacting to text content updates
