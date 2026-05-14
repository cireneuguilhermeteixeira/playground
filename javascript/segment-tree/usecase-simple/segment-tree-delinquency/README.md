# Segment Tree for Delinquency Monitoring by Date

## Use Cases

1. **Daily dashboard**: Query delinquency across origination cohorts
2. **Risk alerts**: Detect when segment exceeds threshold
3. **Reporting**: Sum delinquency by state/product/vintage
4. **Stress testing**: Quickly recalculate totals after simulated defaults
5. **Rebalancing**: Find segments with min/max delinquency rates

## Why Segment Tree Wins Here

- **Updates frequent**: Daily payment processing affects individual loans
- **Queries frequent**: Real-time dashboards, risk monitoring, compliance reports
- **Flexible ranges**: Need arbitrary date ranges, not just fixed buckets
- **Low latency**: O(log n) vs O(n) matters when querying 100K+ loan portfolio

## Structure

Each leaf node represents ONE date in the monitoring calendar.
Each internal node stores the SUM of delinquent balances for its date range.

```
Portfolio: 8 dates with delinquent balances (in dollars)

Date:           05-01  05-02  05-03  05-04  05-05  05-06  05-07  05-08
Delinquent:     $500   $0     $1200  $0     $300   $0     $800   $0

Segment Tree Structure:

                    [0-7]: $2800
                    /            \
            [0-3]: $1700        [4-7]: $1100
            /        \           /        \
        [0-1]: $500  [2-3]: $1200  [4-5]: $300  [6-7]: $800
        /    \       /    \        /    \       /    \
      [0]   [1]    [2]   [3]     [4]   [5]    [6]   [7]
      $500  $0    $1200  $0     $300   $0    $800   $0
```

## Operations

### Query: "What's total delinquent amount between 2026-05-02 and 2026-05-05?"

```
The date index maps:
2026-05-02 -> position 1
2026-05-05 -> position 4

Query(1, 4) traverses:

                    [0-7]: $2800
                    /            \
            [0-3]: $1700        [4-7]: $1100
            /        \           /        \
        [0-1]: $500  [2-3]: $1200  [4-5]: $300  [6-7]: $800
                     ^^^^^^       ^^^^^^
                     fully in     fully in
                     range        range

Result: $1200 + $300 = $1500
```

### Update: "2026-05-03 receives payments, delinquency drops to $400"

```
Update(position_of(2026-05-03), $400) propagates upward:

Before:                          After:
        [0-3]: $1700                    [0-3]: $900
        /        \                      /        \
    [0-1]: $500  [2-3]: $1200      [0-1]: $500  [2-3]: $400
                 /    \                           /    \
               [2]   [3]                        [2]   [3]
              $1200  $0                        $400   $0

Root [0-7] also updates: $2800 -> $2000
```

## Performance

- **Query**: O(log n) after mapping the input dates to indexed positions
- **Update**: O(log n) for changing one day's delinquent balance
- **Space**: O(4n) - ~32MB for 1M loans (8 bytes per node)

## Rust API

The repository now exposes a `DateDelinquencyIndex`:

```rust
let mut index = DateDelinquencyIndex::new(vec![
    d("2026-05-01"),
    d("2026-05-02"),
    d("2026-05-03"),
    d("2026-05-04"),
]);

index.update(d("2026-05-01"), 500)?;
index.update(d("2026-05-03"), 1200)?;

let total = index.query(d("2026-05-02"), d("2026-05-04"));
assert_eq!(total, 1200);
```
