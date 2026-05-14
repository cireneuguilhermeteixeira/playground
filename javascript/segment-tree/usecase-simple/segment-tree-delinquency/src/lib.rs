use chrono::NaiveDate;
use std::collections::HashMap;

pub struct SegmentTree {
    tree: Vec<u64>,
    size: usize,
}

impl SegmentTree {
    pub fn new(number: usize) -> Self {
        assert!(number > 0, "segment tree size must be greater than zero");

        let size = 4 * number;
        Self {
            tree: vec![0; size],
            size: number,
        }
    }

    pub fn update(&mut self, index: usize, value: u64) {
        assert!(index < self.size, "index out of bounds");
        self.update_point(1, 0, self.size - 1, index, value);
    }

    fn update_point(&mut self, node: usize, start: usize, end: usize, index: usize, value: u64) {
        if start == end {
            self.tree[node] = value;
            return;
        }

        let mid = (start + end) / 2;
        if index <= mid {
            self.update_point(2 * node, start, mid, index, value);
        } else {
            self.update_point(2 * node + 1, mid + 1, end, index, value);
        }

        self.tree[node] = self.tree[2 * node] + self.tree[2 * node + 1];
    }

    pub fn query(&self, left: usize, right: usize) -> u64 {
        assert!(left <= right, "left bound must be <= right bound");
        assert!(right < self.size, "query right bound out of bounds");
        self.query_range(1, 0, self.size - 1, left, right)
    }

    fn query_range(&self, node: usize, start: usize, end: usize, l: usize, r: usize) -> u64 {
        if start > r || end < l {
            return 0;
        }

        if start >= l && end <= r {
            return self.tree[node];
        }

        let mid = (start + end) / 2;
        let left = self.query_range(2 * node, start, mid, l, r);
        let right = self.query_range(2 * node + 1, mid + 1, end, l, r);

        left + right
    }
}

pub struct DateDelinquencyIndex {
    dates: Vec<NaiveDate>,
    positions: HashMap<NaiveDate, usize>,
    tree: SegmentTree,
}

impl DateDelinquencyIndex {
    pub fn new(mut dates: Vec<NaiveDate>) -> Self {
        assert!(!dates.is_empty(), "date index must have at least one date");

        dates.sort_unstable();
        dates.dedup();

        let positions = dates
            .iter()
            .copied()
            .enumerate()
            .map(|(idx, date)| (date, idx))
            .collect();

        let tree = SegmentTree::new(dates.len());

        Self {
            dates,
            positions,
            tree,
        }
    }

    pub fn update(&mut self, date: NaiveDate, delinquent_balance: u64) -> Result<(), String> {
        let Some(&index) = self.positions.get(&date) else {
            return Err(format!("date {date} is not indexed"));
        };

        self.tree.update(index, delinquent_balance);
        Ok(())
    }

    pub fn query(&self, start: NaiveDate, end: NaiveDate) -> u64 {
        if start > end {
            return 0;
        }

        let left = self.dates.partition_point(|date| *date < start);
        let right_exclusive = self.dates.partition_point(|date| *date <= end);

        if left >= right_exclusive {
            return 0;
        }

        self.tree.query(left, right_exclusive - 1)
    }

    pub fn indexed_dates(&self) -> &[NaiveDate] {
        &self.dates
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn d(value: &str) -> NaiveDate {
        NaiveDate::parse_from_str(value, "%Y-%m-%d").unwrap()
    }

    #[test]
    fn test_date_query_total_balance() {
        let mut index = DateDelinquencyIndex::new(vec![
            d("2026-05-01"),
            d("2026-05-02"),
            d("2026-05-03"),
            d("2026-05-04"),
            d("2026-05-05"),
            d("2026-05-06"),
            d("2026-05-07"),
        ]);

        index.update(d("2026-05-01"), 500).unwrap();
        index.update(d("2026-05-03"), 1200).unwrap();
        index.update(d("2026-05-05"), 300).unwrap();
        index.update(d("2026-05-07"), 800).unwrap();

        assert_eq!(index.query(d("2026-05-01"), d("2026-05-07")), 2800);
    }

    #[test]
    fn test_date_range_query() {
        let mut index = DateDelinquencyIndex::new(vec![
            d("2026-05-01"),
            d("2026-05-02"),
            d("2026-05-03"),
            d("2026-05-04"),
            d("2026-05-05"),
            d("2026-05-06"),
            d("2026-05-07"),
        ]);

        index.update(d("2026-05-01"), 500).unwrap();
        index.update(d("2026-05-03"), 1200).unwrap();
        index.update(d("2026-05-05"), 300).unwrap();
        index.update(d("2026-05-07"), 800).unwrap();

        assert_eq!(index.query(d("2026-05-02"), d("2026-05-05")), 1500);
    }

    #[test]
    fn test_query_with_dates_without_exact_records() {
        let mut index = DateDelinquencyIndex::new(vec![
            d("2026-05-01"),
            d("2026-05-03"),
            d("2026-05-05"),
            d("2026-05-07"),
        ]);

        index.update(d("2026-05-01"), 500).unwrap();
        index.update(d("2026-05-03"), 1200).unwrap();
        index.update(d("2026-05-05"), 300).unwrap();
        index.update(d("2026-05-07"), 800).unwrap();

        assert_eq!(index.query(d("2026-05-02"), d("2026-05-06")), 1500);
    }

    #[test]
    fn test_payment_received() {
        let mut index =
            DateDelinquencyIndex::new(vec![d("2026-05-01"), d("2026-05-02"), d("2026-05-03")]);

        index.update(d("2026-05-02"), 1200).unwrap();
        assert_eq!(index.query(d("2026-05-01"), d("2026-05-03")), 1200);

        index.update(d("2026-05-02"), 400).unwrap();
        assert_eq!(index.query(d("2026-05-01"), d("2026-05-03")), 400);
    }

    #[test]
    fn test_unknown_date_update_fails() {
        let mut index = DateDelinquencyIndex::new(vec![d("2026-05-01")]);
        let error = index.update(d("2026-05-02"), 100).unwrap_err();

        assert!(error.contains("2026-05-02"));
    }

    #[test]
    fn test_empty_result_for_outside_range() {
        let mut index =
            DateDelinquencyIndex::new(vec![d("2026-05-10"), d("2026-05-11"), d("2026-05-12")]);

        index.update(d("2026-05-10"), 200).unwrap();
        index.update(d("2026-05-11"), 300).unwrap();
        index.update(d("2026-05-12"), 400).unwrap();

        assert_eq!(index.query(d("2026-05-01"), d("2026-05-05")), 0);
    }
}
