use chrono::NaiveDate;
use segment_tree_delinquency::DateDelinquencyIndex;

fn d(value: &str) -> NaiveDate {
    NaiveDate::parse_from_str(value, "%Y-%m-%d").unwrap()
}

fn main() {
    let mut portfolio = DateDelinquencyIndex::new(vec![
        d("2026-05-01"),
        d("2026-05-02"),
        d("2026-05-03"),
        d("2026-05-04"),
        d("2026-05-05"),
        d("2026-05-06"),
        d("2026-05-07"),
        d("2026-05-08"),
    ]);

    println!("=== Delinquency Monitoring by Date ===\n");
    println!("Dates indexed in the segment tree:");
    for date in portfolio.indexed_dates() {
        println!("- {date}");
    }

    println!("\nInitial portfolio: all dates start with zero delinquency");
    println!(
        "Total delinquent from 2026-05-01 to 2026-05-08: ${}\n",
        portfolio.query(d("2026-05-01"), d("2026-05-08"))
    );

    println!("Loading daily delinquent balances");
    portfolio.update(d("2026-05-01"), 500).unwrap();
    portfolio.update(d("2026-05-03"), 1200).unwrap();
    portfolio.update(d("2026-05-05"), 300).unwrap();
    portfolio.update(d("2026-05-07"), 800).unwrap();

    println!("2026-05-01: $500 delinquent");
    println!("2026-05-03: $1200 delinquent");
    println!("2026-05-05: $300 delinquent");
    println!("2026-05-07: $800 delinquent");
    println!(
        "Total delinquency in the indexed period: ${}\n",
        portfolio.query(d("2026-05-01"), d("2026-05-08"))
    );

    println!("Query: delinquency between 2026-05-02 and 2026-05-05");
    println!(
        "Result: ${}\n",
        portfolio.query(d("2026-05-02"), d("2026-05-05"))
    );

    println!("Query: delinquency between 2026-05-04 and 2026-05-08");
    println!(
        "Result: ${}\n",
        portfolio.query(d("2026-05-04"), d("2026-05-08"))
    );

    println!("Day update: 2026-05-03 receives payments, delinquency drops to $400");
    portfolio.update(d("2026-05-03"), 400).unwrap();
    println!(
        "Updated total from 2026-05-01 to 2026-05-08: ${}\n",
        portfolio.query(d("2026-05-01"), d("2026-05-08"))
    );

    println!("Day update: 2026-05-07 is fully cured");
    portfolio.update(d("2026-05-07"), 0).unwrap();
    println!(
        "Updated total from 2026-05-01 to 2026-05-08: ${}\n",
        portfolio.query(d("2026-05-01"), d("2026-05-08"))
    );

    println!("Final query: delinquency between 2026-05-01 and 2026-05-03");
    println!(
        "Result: ${}",
        portfolio.query(d("2026-05-01"), d("2026-05-03"))
    );
}
