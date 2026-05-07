# Simple Segment Tree Use Case

This example creates a business use case that is easier to understand than a full credit decision engine.

The idea is to track the monthly cash flow of a loan portfolio over a real timeline:

- positive value: more cash came in than went out during the month
- negative value: the portfolio issued more loans than it collected in installments

The `segment tree` helps answer questions like:

- how much cash did the portfolio generate during the quarter?
- what happened between `Oct-2024` and `Mar-2025`?
- does the full timeline remain positive after adjusting a renegotiated installment?

## Structure

- `javascript/portfolio-cashflow.js`: JavaScript version
- `rust/`: Rust version with tests

## Example Used

The timeline runs from:

```text
Jan-2024 to May-2026
```

Each month has one net cash flow value. The example includes 29 monthly entries, one for each month in that interval.

A few sample interpretations:

- `Jan-2024 = 1200`: installments and new capital contributed more cash than new loans consumed
- `Feb-2025 = -400`: more cash went out than came in
- `May-2026 = 1200`: the portfolio finished the timeline strongly positive

## What The Example Demonstrates

1. build the `segment tree`
2. query `Jan-2024` to `Jun-2024`
3. query `Oct-2024` to `Mar-2025`
4. update `Feb-2025` from `-400` to `-50`
5. query `Jan-2024` to `May-2026` again
6. support any monthly interval inside the loaded date range

## Run JavaScript

```bash
node usecase-simple/javascript/portfolio-cashflow.js
```

## Run Rust

```bash
cd usecase-simple/rust
cargo run
```

## Run Rust Tests

```bash
cd usecase-simple/rust
cargo test
```
