// Define a class that represents a Segment Tree for range sum queries.
class SegmentTree {
  // Create the tree using the input array values.
  constructor(values) {
    // Store the size of the original array.
    this.size = values.length;
    // Allocate enough space to store the segment tree nodes.
    this.tree = new Array(this.size * 4).fill(0);
    // Copy the original values to avoid mutating the external array reference.
    this.values = [...values];
    // Build the segment tree starting from node 1 covering the whole array.
    this.build(1, 0, this.size - 1);
  }

  // Recursively build the tree for the interval [left, right].
  build(node, left, right) {
    // If the interval has only one element, this is a leaf node.
    if (left === right) {
      // Store the original array value in the leaf node.
      this.tree[node] = this.values[left];
      // Stop the recursion because the leaf is complete.
      return;
    }

    // Calculate the middle point to split the interval into two halves.
    const middle = Math.floor((left + right) / 2);
    // Build the left child for the interval [left, middle].
    this.build(node * 2, left, middle);
    // Build the right child for the interval [middle + 1, right].
    this.build(node * 2 + 1, middle + 1, right);
    // Store the sum of both children in the current node.
    this.tree[node] = this.tree[node * 2] + this.tree[node * 2 + 1];
  }

  // Public method to query the sum in the interval [queryLeft, queryRight].
  query(queryLeft, queryRight) {
    // Start the recursive range query from the root node.
    return this.queryRange(1, 0, this.size - 1, queryLeft, queryRight);
  }

  // Recursively calculate the sum for the query interval.
  queryRange(node, left, right, queryLeft, queryRight) {
    // If the current interval does not overlap the query, contribute 0.
    if (queryRight < left || right < queryLeft) {
      // Return the neutral element for sum.
      return 0;
    }

    // If the current interval is fully inside the query, use the stored sum.
    if (queryLeft <= left && right <= queryRight) {
      // Return the precomputed value of this segment.
      return this.tree[node];
    }

    // Calculate the middle point to split the interval.
    const middle = Math.floor((left + right) / 2);
    // Query the left child for its contribution.
    const leftSum = this.queryRange(node * 2, left, middle, queryLeft, queryRight);
    // Query the right child for its contribution.
    const rightSum = this.queryRange(node * 2 + 1, middle + 1, right, queryLeft, queryRight);

    // Return the total sum from both children.
    return leftSum + rightSum;
  }

  // Public method to update a single index with a new value.
  update(index, newValue) {
    // Update the tree nodes that depend on this index.
    this.updateNode(1, 0, this.size - 1, index, newValue);
    // Update the copied source array as well.
    this.values[index] = newValue;
  }

  // Recursively update the path from the root to the target leaf.
  updateNode(node, left, right, index, newValue) {
    // If we reached the exact leaf, replace its value.
    if (left === right) {
      // Store the new value in the leaf node.
      this.tree[node] = newValue;
      // Stop the recursion because the leaf is updated.
      return;
    }

    // Calculate the middle point to decide which branch to follow.
    const middle = Math.floor((left + right) / 2);

    // If the target index is on the left half, recurse left.
    if (index <= middle) {
      // Update the left child interval.
      this.updateNode(node * 2, left, middle, index, newValue);
    } else {
      // Otherwise update the right child interval.
      this.updateNode(node * 2 + 1, middle + 1, right, index, newValue);
    }

    // Recompute the current node sum after updating one child.
    this.tree[node] = this.tree[node * 2] + this.tree[node * 2 + 1];
  }
}

// Create the example input array.
const values = [2, 1, 5, 3, 4];
// Build the segment tree from the example array.
const segmentTree = new SegmentTree(values);

// Print the original array.
console.log("Initial array:", values);
// Print the internal tree array to visualize the built structure.
console.log("Tree array after build:", segmentTree.tree.slice(1, 10));

// Explain the build process for the example input.
console.log("\nDesk check for build with values = [2, 1, 5, 3, 4]:");
// Show the root interval.
console.log("Node 1 covers [0,4] and stores 15 because 2 + 1 + 5 + 3 + 4 = 15.");
// Show the left subtree summary.
console.log("Node 2 covers [0,2] and stores 8 because 2 + 1 + 5 = 8.");
// Show the right subtree summary.
console.log("Node 3 covers [3,4] and stores 7 because 3 + 4 = 7.");
// Show a lower-level node from the left subtree.
console.log("Node 4 covers [0,1] and stores 3 because 2 + 1 = 3.");
// Show the leaf for index 2.
console.log("Node 5 covers [2,2] and stores 5.");
// Show the leaves for indices 3 and 4.
console.log("Nodes 6 and 7 store 3 and 4 for indices 3 and 4.");

// Explain how the query works before printing the result.
console.log("\nDesk check for query [1,3]:");
// Explain which original values participate in the query.
console.log("The range [1,3] includes values 1, 5, and 3.");
// Explain the expected manual result.
console.log("Manual sum = 1 + 5 + 3 = 9.");
// Run the query and store the result.
const firstQueryResult = segmentTree.query(1, 3);
// Print the query result returned by the segment tree.
console.log("Segment tree result for [1,3]:", firstQueryResult);

// Explain the update operation before applying it.
console.log("\nDesk check for update index 2 -> 10:");
// State the old and new value at index 2.
console.log("Index 2 changes from 5 to 10.");
// Apply the update to the segment tree.
segmentTree.update(2, 10);
// Show the updated array values.
console.log("Updated array:", segmentTree.values);
// Show the relevant tree nodes after the update.
console.log("Tree array after update:", segmentTree.tree.slice(1, 10));
// Explain which nodes changed after the update.
console.log("Node 5 becomes 10, node 2 becomes 13, and node 1 becomes 20.");

// Explain the same query after the update.
console.log("\nDesk check for query [1,3] after update:");
// Explain the new values involved in the range.
console.log("The range [1,3] now includes values 1, 10, and 3.");
// Explain the new expected manual result.
console.log("Manual sum = 1 + 10 + 3 = 14.");
// Run the query again and store the result.
const secondQueryResult = segmentTree.query(1, 3);
// Print the query result after the update.
console.log("Segment tree result for [1,3] after update:", secondQueryResult);
