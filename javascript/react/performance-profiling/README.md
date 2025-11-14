# React Performance Profiling – Deep Dive Guide

This document explains **how React DevTools Components & Profiler work**, how to interpret commits, flamegraphs, ranked views, memory usage, and how to identify performance issues in your application.  
All examples refer to your POC, including **HeavyList**, **ReRenderTest**, and **MemoryLeakDemo**, and the screenshots you provided.

---

## Overview

This project intentionally includes **heavy, unoptimized components** to demonstrate:

- Excessive re-renders  
- CPU-heavy rendering  
- Memory leaks  
- Slow commit times  
- FPS drops  
- Non-virtualized lists  
- Uncached expensive computations  

This README explains how to diagnose these issues using **React DevTools**, **Chrome DevTools**, and **React Scan**.

This logs every component render and gives you hints about what triggered it.

---

## React DevTools Components Tab

The **Components** panel allows you to:

### Inspect props, state, and context  

You can see what changed between renders.
<img width="1043" height="581" alt="image" src="https://github.com/user-attachments/assets/afcb1fe3-f78c-4678-9133-3f98c1b3694d" />


### Highlight updates (VERY useful)

Enable in settings:

```
Highlight updates when components render
```

This makes the screen flash whenever a component re-renders.
<img width="833" height="617" alt="image" src="https://github.com/user-attachments/assets/e704a400-8e30-4671-b76f-caac6fe18b3c" />

### Diagnose unnecessary re-renders  

Example from your POC:

`ReRenderTest` demonstrates how unstable object/function identities cause children to re-render even when values haven't changed.

---

## React DevTools Profiler

This is the most powerful tool for understanding performance.

The Profiler records **commits**.  
A commit is:

> “The moment React applies changes to the DOM after running renders.”

Each commit has:

- **Render duration**  
- **Layout effects duration**  
- **Passive effects duration**


```
Render: 1799.2ms
Layout effects: <0.1ms
Passive effects: 2.2ms
```

The main problem here is:

### 1.8 seconds of render time  

This is intentionally slow due to:

- HeavyList rendering 1000+ items  
- `heavyCompute(75_000)` inside each item  
- No memoization  
- No virtualization  

This is **exactly the type of issue** the Profiler helps detect.

---

## Flamegraph View
<img width="1049" height="567" alt="image" src="https://github.com/user-attachments/assets/34370c96-5913-4ab8-88de-ca5aff2991a0" />

The **Flamegraph** shows:

> “Which components were involved in THIS commit?”

It shows a tree-like visualization of render cost.

From your screenshot, you saw:

```
App
ReactScanProvider
HeavyList
```

This is because:

- Only **those components** rendered during that commit.
- It was your **initial mount commit**, so only the top tree was rendered.

The Flamegraph does **NOT** show components that did not render during that commit.

---

## Ranked View

The **Ranked** view shows:

> “Which components took the most time in this commit (ordered by cost)?”

Unlike Flamegraph, Ranked **does not show hierarchy**.  
It simply reveals the heaviest components.
<img width="1068" height="594" alt="image" src="https://github.com/user-attachments/assets/12c3eb98-d1cb-4e14-bc0f-c33ac4ff6bf6" />

---

## Understanding Commit Times


```
1.8s for 1799.2ms
3.9s for 11.3ms
5.9s for 4.3ms
```

### ✔ Left number → WHEN the commit happened  

`1.8s` → This commit occurred 1.8 seconds after recording began.

### ✔ Right number → HOW LONG the commit took  

`1799.2ms` → The commit took 1.8 seconds to complete.

---

## Diagnosing Issues

### HeavyList – extremely slow  

- Huge list  
- Heavy CPU work  
- No virtualization  
- No memoization  

### ReRenderTest – unnecessary renders  

- Unstable prop identity  
- Fixed with `useMemo` + `useCallback`

### MemoryLeakDemo – intentional leak  

- Missing cleanup on intervals + listeners  
- Retained objects visible in Chrome Memory DevTools

---

## Detecting Memory Leaks

### Chrome DevTools → Memory

Use:

- Allocation Timeline  
- Heap Snapshot  
- Retainers analysis  
<img width="392" height="541" alt="image" src="https://github.com/user-attachments/assets/36af2e8f-1b0e-4448-afb5-007d8a28ab48" />

Expected:

- JS Heap grows every mount/unmount  
- Detached DOM nodes appear  
- Event listeners not freed  
- Arrays retained  

---

## Detecting Excessive Re-Renders

Methods:

- React DevTools “Highlight updates”  
- Flamegraph  
- Ranked view  
- React Scan console logs  

---

## Additional Tools

### Lighthouse  

- LCP  
- INP  
- CLS  
- TTFB  

### Web Vitals  
```
import { onCLS, onFID, onLCP, onINP, onTTFB } from 'web-vitals'
onCLS(console.log)
onFID(console.log)
onLCP(console.log)
onINP(console.log)
onTTFB(console.log)
```

Core Web Vitals evaluate how “fast and stable” a web page feels to real users.
The five main metrics are:

TTFB — Time to First Byte (network/server responsiveness)

FID — First Input Delay (old input metric)

INP — Interaction to Next Paint (new, primary input responsiveness metric)

CLS — Cumulative Layout Shift (visual stability)

LCP — Largest Contentful Paint (loading performance)
<img width="1067" height="267" alt="image" src="https://github.com/user-attachments/assets/e5c2eb58-e9a5-4bf6-892a-d515205dc6dc" />

### INP (Interaction to Next Paint)

Example:
```
{name: 'INP', value: 2168, rating: 'poor'}
```

INP is now the most important responsiveness metric.
It measures:

The time between a user interaction (click, tap, keypress) and the moment the browser paints the next frame.

2168ms = extremely poor.


- HeavyList freezes the main thread
- heavyCompute(75_000) blocks JS
- No virtualization
- No memoization

### CLS (Cumulative Layout Shift)

Example:
```
{name: 'CLS', value: 0.757, rating: 'poor'}
```

CLS measures:

How much the layout shifts unexpectedly during load.

CLS should be < 0.1.
Your value (0.75) is very high, meaning the UI shifts around significantly.

Common causes:

- Content inserted without fixed dimensions
- React components mounting late
- Large elements pushing layout
- Fonts loading after initial paint


This leads to severe interaction delays — perfect for demonstrating performance problems.


### React scan
<img width="1172" height="893" alt="image" src="https://github.com/user-attachments/assets/c73b47f2-1191-4315-a628-33d988fcdf5c" />
<img width="556" height="417" alt="image" src="https://github.com/user-attachments/assets/60c0895e-0262-47fe-be5b-229c90197bdb" />

In short:

It intercepts React's internal calls (reconciler) to know when each component rendered.
It maintains a "store" with information about each render:

- which component,
- how long it took,
- why it rendered (props/state/context that changed),
- if it was an "unnecessary" render (DOM didn't change).



Draw outlines on components when they render;
populate the toolbar with a component tree and counters;

Trigger the built-in profiler (that little bell that shows FPS drops, slow interactions, etc.).


It's like a "Why Did You Render" + React DevTools, but visual and always on.
