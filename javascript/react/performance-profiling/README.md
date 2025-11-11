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

### Highlight updates (VERY useful)

Enable in settings:

```
Highlight updates when components render
```

This makes the screen flash whenever a component re-renders.

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

Example from your screenshot:

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

---

## Understanding Commit Times

Example from your screenshot:

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

- Already included in the project

### Chrome Performance Panel  

- Long tasks  
- Layout shifts  
- Paint/composite performance  

---
