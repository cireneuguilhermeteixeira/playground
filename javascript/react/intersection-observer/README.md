# Intersection Observer POC

This project is a small React + TypeScript proof of concept for the browser `IntersectionObserver` API.

It starts with a simple use case: tracking which content sections are currently visible in the viewport.

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

## Next steps

This starter can be extended later for:

- lazy loading images
- scroll-triggered animations
- analytics for viewed sections
- active table-of-contents tracking
