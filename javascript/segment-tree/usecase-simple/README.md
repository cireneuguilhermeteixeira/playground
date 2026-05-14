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

## Visual Example

Before looking at the full timeline, it helps to see a very small example with only 4 months:

```text
Jan-2024 = 1200
Feb-2024 = -800
Mar-2024 = 950
Apr-2024 = 400
```

The segment tree stores the sum for each interval:

```text
                    [Jan-2024..Apr-2024]
                            1750
                         /         \
            [Jan-2024..Feb-2024]   [Mar-2024..Apr-2024]
                    400                     1350
                   /   \                   /    \
          [Jan] 1200  [Feb] -800   [Mar] 950  [Apr] 400
```

This is easier to read from bottom to top:

- each leaf is one month
- each parent stores the sum of its two children
- the root stores the total for the whole interval

Example query:

```text
Query Jan-2024..Mar-2024
```

Manual calculation:

```text
1200 + (-800) + 950 = 1350
```

How the tree answers it:

- take the full value of `[Jan-2024..Feb-2024]`, which is `400`
- take only `[Mar-2024]`, which is `950`
- ignore `[Apr-2024]`

Final result:

```text
400 + 950 = 1350
```

That is the main idea of the data structure: instead of summing month by month every time, it reuses sums that were already precomputed for larger intervals.

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
