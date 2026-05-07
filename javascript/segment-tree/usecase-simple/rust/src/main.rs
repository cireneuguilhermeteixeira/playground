use std::collections::HashMap;

struct SegmentTree {
    size: usize,
    tree: Vec<i32>,
    values: Vec<i32>,
}

impl SegmentTree {
    fn new(values: Vec<i32>) -> Self {
        let size = values.len();
        let tree = vec![0; size * 4];
        let mut segment_tree = Self { size, tree, values };
        segment_tree.build(1, 0, size - 1);
        segment_tree
    }

    fn build(&mut self, node: usize, left: usize, right: usize) {
        if left == right {
            self.tree[node] = self.values[left];
            return;
        }

        let middle = (left + right) / 2;
        self.build(node * 2, left, middle);
        self.build(node * 2 + 1, middle + 1, right);
        self.tree[node] = self.tree[node * 2] + self.tree[node * 2 + 1];
    }

    fn query(&self, query_left: usize, query_right: usize) -> i32 {
        self.query_range(1, 0, self.size - 1, query_left, query_right)
    }

    fn query_range(
        &self,
        node: usize,
        left: usize,
        right: usize,
        query_left: usize,
        query_right: usize,
    ) -> i32 {
        if query_right < left || right < query_left {
            return 0;
        }

        if query_left <= left && right <= query_right {
            return self.tree[node];
        }

        let middle = (left + right) / 2;
        let left_sum = self.query_range(node * 2, left, middle, query_left, query_right);
        let right_sum =
            self.query_range(node * 2 + 1, middle + 1, right, query_left, query_right);
        left_sum + right_sum
    }

    fn update(&mut self, index: usize, new_value: i32) {
        self.update_node(1, 0, self.size - 1, index, new_value);
        self.values[index] = new_value;
    }

    fn update_node(
        &mut self,
        node: usize,
        left: usize,
        right: usize,
        index: usize,
        new_value: i32,
    ) {
        if left == right {
            self.tree[node] = new_value;
            return;
        }

        let middle = (left + right) / 2;

        if index <= middle {
            self.update_node(node * 2, left, middle, index, new_value);
        } else {
            self.update_node(node * 2 + 1, middle + 1, right, index, new_value);
        }

        self.tree[node] = self.tree[node * 2] + self.tree[node * 2 + 1];
    }
}

struct PortfolioTimeline {
    labels: Vec<String>,
    index_by_label: HashMap<String, usize>,
    segment_tree: SegmentTree,
}

impl PortfolioTimeline {
    fn new(
        start_year: i32,
        start_month: usize,
        end_year: i32,
        end_month: usize,
        monthly_net_cash_flow: Vec<i32>,
    ) -> Result<Self, String> {
        let labels = build_month_labels(start_year, start_month, end_year, end_month);

        if labels.len() != monthly_net_cash_flow.len() {
            return Err(
                "The number of cash flow entries must match the number of generated months."
                    .to_string(),
            );
        }

        let index_by_label = labels
            .iter()
            .enumerate()
            .map(|(index, label)| (label.clone(), index))
            .collect();

        Ok(Self {
            labels,
            index_by_label,
            segment_tree: SegmentTree::new(monthly_net_cash_flow),
        })
    }

    fn get_index(&self, label: &str) -> Result<usize, String> {
        self.index_by_label
            .get(label)
            .copied()
            .ok_or_else(|| format!("Unknown month label: {label}"))
    }

    fn query_by_date_range(&self, start_label: &str, end_label: &str) -> Result<i32, String> {
        let start_index = self.get_index(start_label)?;
        let end_index = self.get_index(end_label)?;

        if start_index > end_index {
            return Err(format!(
                "Invalid range: {start_label} comes after {end_label}"
            ));
        }

        Ok(self.segment_tree.query(start_index, end_index))
    }

    fn update_month(&mut self, label: &str, new_value: i32) -> Result<(), String> {
        let index = self.get_index(label)?;
        self.segment_tree.update(index, new_value);
        Ok(())
    }
}

const MONTH_NAMES: [&str; 12] = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

fn build_month_labels(
    start_year: i32,
    start_month: usize,
    end_year: i32,
    end_month: usize,
) -> Vec<String> {
    let mut labels = Vec::new();
    let mut year = start_year;
    let mut month = start_month;

    while year < end_year || (year == end_year && month <= end_month) {
        labels.push(format!("{}-{}", MONTH_NAMES[month], year));
        month += 1;

        if month == 12 {
            month = 0;
            year += 1;
        }
    }

    labels
}

fn main() -> Result<(), String> {
    let monthly_net_cash_flow = vec![
        1200, -800, 950, 400, -300, 700, 500, -150, 300, 1000, -200, 650, 900, -400, 1100,
        200, -100, 850, 400, -250, 600, 300, -350, 1000, 750, -500, 950, 350, 1200,
    ];

    let mut timeline = PortfolioTimeline::new(2024, 0, 2026, 4, monthly_net_cash_flow)?;

    println!("Simple use case: monthly cash flow for a loan portfolio");
    println!("Timeline starts at: {}", timeline.labels[0]);
    println!(
        "Timeline ends at: {}",
        timeline.labels[timeline.labels.len() - 1]
    );
    println!("Total months loaded: {}", timeline.labels.len());
    println!(
        "Initial net cash flow entries: {:?}",
        timeline.segment_tree.values
    );
    println!("Root node after build: {}", timeline.segment_tree.tree[1]);

    let first_window = timeline.query_by_date_range("Jan-2024", "Jun-2024")?;
    println!("\nQuery 1: total for Jan-2024 to Jun-2024");
    println!("Manual calculation: 1200 + (-800) + 950 + 400 + (-300) + 700 = 2150");
    println!("Segment tree result: {}", first_window);

    let second_window = timeline.query_by_date_range("Oct-2024", "Mar-2025")?;
    println!("\nQuery 2: total for Oct-2024 to Mar-2025");
    println!("Manual calculation: 1000 + (-200) + 650 + 900 + (-400) + 1100 = 3050");
    println!("Segment tree result: {}", second_window);

    println!("\nUpdate: a renegotiation improves Feb-2025 by 350.");
    println!("Before: -400. After: -50.");
    timeline.update_month("Feb-2025", -50)?;

    println!("Updated root node: {}", timeline.segment_tree.tree[1]);
    println!(
        "Updated value for Feb-2025: {}",
        timeline.segment_tree.values[timeline.get_index("Feb-2025")?]
    );

    let full_window = timeline.query_by_date_range("Jan-2024", "May-2026")?;
    println!("\nQuery 3: total for Jan-2024 to May-2026");
    println!("Manual calculation after update: 11600");
    println!("Segment tree result: {}", full_window);

    let updated_window = timeline.query_by_date_range("Oct-2024", "Mar-2025")?;
    println!("\nQuery 4: total for Oct-2024 to Mar-2025 after the update");
    println!("Manual calculation after update: 3400");
    println!("Segment tree result: {}", updated_window);

    println!("\nInterpretation:");
    println!("The tree now works on real month labels, not just a fixed semester.");
    println!("Any monthly interval inside Jan-2024 to May-2026 can be queried in logarithmic time.");

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::PortfolioTimeline;

    fn sample_timeline() -> PortfolioTimeline {
        let monthly_net_cash_flow = vec![
            1200, -800, 950, 400, -300, 700, 500, -150, 300, 1000, -200, 650, 900, -400, 1100,
            200, -100, 850, 400, -250, 600, 300, -350, 1000, 750, -500, 950, 350, 1200,
        ];

        PortfolioTimeline::new(2024, 0, 2026, 4, monthly_net_cash_flow).unwrap()
    }

    #[test]
    fn builds_labels_for_the_full_date_range() {
        let timeline = sample_timeline();

        assert_eq!(timeline.labels.first().unwrap(), "Jan-2024");
        assert_eq!(timeline.labels.last().unwrap(), "May-2026");
        assert_eq!(timeline.labels.len(), 29);
    }

    #[test]
    fn query_returns_expected_sum_for_any_date_interval() {
        let timeline = sample_timeline();

        assert_eq!(
            timeline
                .query_by_date_range("Oct-2024", "Mar-2025")
                .unwrap(),
            3050
        );
    }

    #[test]
    fn update_changes_values_and_future_queries() {
        let mut timeline = sample_timeline();

        timeline.update_month("Feb-2025", -50).unwrap();

        assert_eq!(
            timeline.segment_tree.values[timeline.get_index("Feb-2025").unwrap()],
            -50
        );
        assert_eq!(
            timeline
                .query_by_date_range("Jan-2024", "May-2026")
                .unwrap(),
            11600
        );
        assert_eq!(
            timeline
                .query_by_date_range("Oct-2024", "Mar-2025")
                .unwrap(),
            3400
        );
    }

    #[test]
    fn query_full_range_returns_total_sum() {
        let timeline = sample_timeline();

        assert_eq!(
            timeline
                .query_by_date_range("Jan-2024", "May-2026")
                .unwrap(),
            11250
        );
    }

    #[test]
    fn query_single_month_returns_exact_value() {
        let timeline = sample_timeline();

        assert_eq!(
            timeline.query_by_date_range("Feb-2025", "Feb-2025").unwrap(),
            -400
        );
    }
}
