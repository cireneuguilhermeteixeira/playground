class SegmentTree {
  constructor(values) {
    this.size = values.length;
    this.tree = new Array(this.size * 4).fill(0);
    this.values = [...values];
    this.build(1, 0, this.size - 1);
  }

  build(node, left, right) {
    if (left === right) {
      this.tree[node] = this.values[left];
      return;
    }

    const middle = Math.floor((left + right) / 2);
    this.build(node * 2, left, middle);
    this.build(node * 2 + 1, middle + 1, right);
    this.tree[node] = this.tree[node * 2] + this.tree[node * 2 + 1];
  }

  query(queryLeft, queryRight) {
    return this.queryRange(1, 0, this.size - 1, queryLeft, queryRight);
  }

  queryRange(node, left, right, queryLeft, queryRight) {
    if (queryRight < left || right < queryLeft) {
      return 0;
    }

    if (queryLeft <= left && right <= queryRight) {
      return this.tree[node];
    }

    const middle = Math.floor((left + right) / 2);
    const leftSum = this.queryRange(node * 2, left, middle, queryLeft, queryRight);
    const rightSum = this.queryRange(node * 2 + 1, middle + 1, right, queryLeft, queryRight);
    return leftSum + rightSum;
  }

  update(index, newValue) {
    this.updateNode(1, 0, this.size - 1, index, newValue);
    this.values[index] = newValue;
  }

  updateNode(node, left, right, index, newValue) {
    if (left === right) {
      this.tree[node] = newValue;
      return;
    }

    const middle = Math.floor((left + right) / 2);

    if (index <= middle) {
      this.updateNode(node * 2, left, middle, index, newValue);
    } else {
      this.updateNode(node * 2 + 1, middle + 1, right, index, newValue);
    }

    this.tree[node] = this.tree[node * 2] + this.tree[node * 2 + 1];
  }
}

class PortfolioTimeline {
  constructor(startYear, startMonth, endYear, endMonth, monthlyNetCashFlow) {
    this.labels = buildMonthLabels(startYear, startMonth, endYear, endMonth);

    if (this.labels.length !== monthlyNetCashFlow.length) {
      throw new Error("The number of cash flow entries must match the number of generated months.");
    }

    this.indexByLabel = new Map(this.labels.map((label, index) => [label, index]));
    this.segmentTree = new SegmentTree(monthlyNetCashFlow);
  }

  getIndex(label) {
    const index = this.indexByLabel.get(label);

    if (index === undefined) {
      throw new Error(`Unknown month label: ${label}`);
    }

    return index;
  }

  queryByDateRange(startLabel, endLabel) {
    const startIndex = this.getIndex(startLabel);
    const endIndex = this.getIndex(endLabel);

    if (startIndex > endIndex) {
      throw new Error(`Invalid range: ${startLabel} comes after ${endLabel}`);
    }

    return this.segmentTree.query(startIndex, endIndex);
  }

  updateMonth(label, newValue) {
    const index = this.getIndex(label);
    this.segmentTree.update(index, newValue);
  }
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function buildMonthLabels(startYear, startMonth, endYear, endMonth) {
  const labels = [];
  let year = startYear;
  let month = startMonth;

  while (year < endYear || (year === endYear && month <= endMonth)) {
    labels.push(`${MONTH_NAMES[month]}-${year}`);
    month += 1;

    if (month === 12) {
      month = 0;
      year += 1;
    }
  }

  return labels;
}

const monthlyNetCashFlow = [
  1200, -800, 950, 400, -300, 700, 500, -150, 300, 1000, -200, 650,
  900, -400, 1100, 200, -100, 850, 400, -250, 600, 300, -350, 1000,
  750, -500, 950, 350, 1200
];

const timeline = new PortfolioTimeline(2024, 0, 2026, 4, monthlyNetCashFlow);

console.log("Simple use case: monthly cash flow for a loan portfolio");
console.log("Timeline starts at:", timeline.labels[0]);
console.log("Timeline ends at:", timeline.labels[timeline.labels.length - 1]);
console.log("Total months loaded:", timeline.labels.length);
console.log("Initial net cash flow entries:", timeline.segmentTree.values);
console.log("Root node after build:", timeline.segmentTree.tree[1]);

const firstWindow = timeline.queryByDateRange("Jan-2024", "Jun-2024");
console.log("\nQuery 1: total for Jan-2024 to Jun-2024");
console.log("Manual calculation: 1200 + (-800) + 950 + 400 + (-300) + 700 = 2150");
console.log("Segment tree result:", firstWindow);

const secondWindow = timeline.queryByDateRange("Oct-2024", "Mar-2025");
console.log("\nQuery 2: total for Oct-2024 to Mar-2025");
console.log("Manual calculation: 1000 + (-200) + 650 + 900 + (-400) + 1100 = 3050");
console.log("Segment tree result:", secondWindow);

console.log("\nUpdate: a renegotiation improves Feb-2025 by 350.");
console.log("Before: -400. After: -50.");
timeline.updateMonth("Feb-2025", -50);

console.log("Updated root node:", timeline.segmentTree.tree[1]);
console.log("Updated value for Feb-2025:", timeline.segmentTree.values[timeline.getIndex("Feb-2025")]);

const fullWindow = timeline.queryByDateRange("Jan-2024", "May-2026");
console.log("\nQuery 3: total for Jan-2024 to May-2026");
console.log("Manual calculation after update: 11600");
console.log("Segment tree result:", fullWindow);

const updatedWindow = timeline.queryByDateRange("Oct-2024", "Mar-2025");
console.log("\nQuery 4: total for Oct-2024 to Mar-2025 after the update");
console.log("Manual calculation after update: 3400");
console.log("Segment tree result:", updatedWindow);

console.log("\nInterpretation:");
console.log("The tree now works on real month labels, not just a fixed semester.");
console.log("Any monthly interval inside Jan-2024 to May-2026 can be queried in logarithmic time.");
