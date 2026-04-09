# Rust Segment Tree Example

This folder contains a basic Segment Tree implementation in Rust for range sum queries.

The example mirrors the JavaScript version and demonstrates:

- building the segment tree from an input array
- querying the sum of a range
- updating a single element
- printing a small desk-check explanation for the sample input

## Files

- `src/main.rs`: Segment Tree implementation and runnable example

## Run

```bash
cargo run
```

## Test

```bash
cargo test
```

## Sample Input

The example uses:

```rust
let values = vec![2, 1, 5, 3, 4];
```

It builds the tree, queries the range `[1, 3]`, updates index `2` to `10`, and queries the same range again.

## Notes

- The tree uses an array-backed representation.
- The root starts at index `1`.
- The left child of `node` is `node * 2`.
- The right child of `node` is `node * 2 + 1`.
- The internal tree array is allocated with `size * 4` slots, which is a common safe upper bound.
