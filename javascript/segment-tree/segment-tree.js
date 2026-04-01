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

const values = [2, 1, 5, 3, 4];
const segmentTree = new SegmentTree(values);

console.log("Initial Array:", values);
console.log("Sum of range [1, 3]:", segmentTree.query(1, 3));

segmentTree.update(2, 10);

console.log("After updating index 2 to 10:");
console.log("New Array:", segmentTree.values);
console.log("Sum of range [1, 3]:", segmentTree.query(1, 3));