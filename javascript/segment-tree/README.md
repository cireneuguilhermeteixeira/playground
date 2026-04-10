# Segment Tree Playground

This repository is a small learning playground for understanding how a Segment Tree works.

It contains:

- a JavaScript implementation with a visual interactive page
- a Rust implementation with a console example and unit tests

The goal of the repo is educational. It shows how a Segment Tree is:

- built from an input array
- stored internally as an array-based tree
- used for range sum queries
- updated when a single element changes

## Repository Structure

### `javascript/`

This folder contains the JavaScript examples:

- `segment-tree.js`: basic Segment Tree example with build, query, update, and desk-check output
- `index.html`: interactive visualizer that shows the array, the tree structure, and the build/query steps
- `server.js`: small local HTTP server to open the visualizer

Run the JavaScript console example:

```bash
cd javascript
npm start
```

Run the visualizer:

```bash
cd javascript
npm run visual
```

Then open:

```text
http://127.0.0.1:3000
```

### `rust/`

This folder contains the Rust example:

- `src/main.rs`: Segment Tree implementation and runnable example
- unit tests for build, query, and update behavior

Run the Rust example:

```bash
cd rust
cargo run
```

Run the Rust tests:

```bash
cd rust
cargo test
```

## What This Repo Demonstrates

The examples use Segment Trees for range sum queries.

For a sample array such as:

```text
[2, 1, 5, 3, 4]
```

the repo demonstrates:

1. building the tree
2. querying a range like `[1, 3]`
3. updating an index such as `2 -> 10`
4. querying again after the update

## Notes

- The implementations use the common array-backed representation of a Segment Tree.
- In the Rust and JavaScript console examples, the root starts at index `1`.
- Child relationships follow:
  - left child: `node * 2`
  - right child: `node * 2 + 1`
- The visualizer also helps explain how the tree array is filled during construction.
