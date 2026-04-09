// Define a struct that represents a Segment Tree for range sum queries.
struct SegmentTree {
    // Store the size of the original array.
    size: usize,
    // Store the segment tree nodes in an array representation.
    tree: Vec<i32>,
    // Store a copy of the original values.
    values: Vec<i32>,
}

impl SegmentTree {
    // Create the tree using the input array values.
    fn new(values: Vec<i32>) -> Self {
        // Store the size of the original array.
        let size = values.len();
        // Allocate enough space to store the segment tree nodes.
        let tree = vec![0; size * 4];
        // Create the segment tree instance.
        let mut segment_tree = Self {
            size,
            tree,
            values,
        };
        // Build the segment tree starting from node 1 covering the whole array.
        segment_tree.build(1, 0, size - 1);
        // Return the built segment tree.
        segment_tree
    }

    // Recursively build the tree for the interval [left, right].
    fn build(&mut self, node: usize, left: usize, right: usize) {
        // If the interval has only one element, this is a leaf node.
        if left == right {
            // Store the original array value in the leaf node.
            self.tree[node] = self.values[left];
            // Stop the recursion because the leaf is complete.
            return;
        }

        // Calculate the middle point to split the interval into two halves.
        let middle = (left + right) / 2;
        // Build the left child for the interval [left, middle].
        self.build(node * 2, left, middle);
        // Build the right child for the interval [middle + 1, right].
        self.build(node * 2 + 1, middle + 1, right);
        // Store the sum of both children in the current node.
        self.tree[node] = self.tree[node * 2] + self.tree[node * 2 + 1];
    }

    // Public method to query the sum in the interval [query_left, query_right].
    fn query(&self, query_left: usize, query_right: usize) -> i32 {
        // Start the recursive range query from the root node.
        self.query_range(1, 0, self.size - 1, query_left, query_right)
    }

    // Recursively calculate the sum for the query interval.
    fn query_range(
        &self,
        node: usize,
        left: usize,
        right: usize,
        query_left: usize,
        query_right: usize,
    ) -> i32 {
        // If the current interval does not overlap the query, contribute 0.
        if query_right < left || right < query_left {
            // Return the neutral element for sum.
            return 0;
        }

        // If the current interval is fully inside the query, use the stored sum.
        if query_left <= left && right <= query_right {
            // Return the precomputed value of this segment.
            return self.tree[node];
        }

        // Calculate the middle point to split the interval.
        let middle = (left + right) / 2;
        // Query the left child for its contribution.
        let left_sum = self.query_range(node * 2, left, middle, query_left, query_right);
        // Query the right child for its contribution.
        let right_sum =
            self.query_range(node * 2 + 1, middle + 1, right, query_left, query_right);

        // Return the total sum from both children.
        left_sum + right_sum
    }

    // Public method to update a single index with a new value.
    fn update(&mut self, index: usize, new_value: i32) {
        // Update the tree nodes that depend on this index.
        self.update_node(1, 0, self.size - 1, index, new_value);
        // Update the copied source array as well.
        self.values[index] = new_value;
    }

    // Recursively update the path from the root to the target leaf.
    fn update_node(
        &mut self,
        node: usize,
        left: usize,
        right: usize,
        index: usize,
        new_value: i32,
    ) {
        // If we reached the exact leaf, replace its value.
        if left == right {
            // Store the new value in the leaf node.
            self.tree[node] = new_value;
            // Stop the recursion because the leaf is updated.
            return;
        }

        // Calculate the middle point to decide which branch to follow.
        let middle = (left + right) / 2;

        // If the target index is on the left half, recurse left.
        if index <= middle {
            // Update the left child interval.
            self.update_node(node * 2, left, middle, index, new_value);
        } else {
            // Otherwise update the right child interval.
            self.update_node(node * 2 + 1, middle + 1, right, index, new_value);
        }

        // Recompute the current node sum after updating one child.
        self.tree[node] = self.tree[node * 2] + self.tree[node * 2 + 1];
    }
}

fn main() {
    // Create the example input array.
    let values = vec![2, 1, 5, 3, 4];
    // Build the segment tree from the example array.
    let mut segment_tree = SegmentTree::new(values.clone());

    // Print the original array.
    println!("Initial array: {:?}", values);
    // Print the internal tree array to visualize the built structure.
    println!("Tree array after build: {:?}", &segment_tree.tree[1..10]);

    // Explain the build process for the example input.
    println!("\nDesk check for build with values = [2, 1, 5, 3, 4]:");
    // Show the root interval.
    println!("Node 1 covers [0,4] and stores 15 because 2 + 1 + 5 + 3 + 4 = 15.");
    // Show the left subtree summary.
    println!("Node 2 covers [0,2] and stores 8 because 2 + 1 + 5 = 8.");
    // Show the right subtree summary.
    println!("Node 3 covers [3,4] and stores 7 because 3 + 4 = 7.");
    // Show a lower-level node from the left subtree.
    println!("Node 4 covers [0,1] and stores 3 because 2 + 1 = 3.");
    // Show the leaf for index 2.
    println!("Node 5 covers [2,2] and stores 5.");
    // Show the leaves for indices 3 and 4.
    println!("Nodes 6 and 7 store 3 and 4 for indices 3 and 4.");

    // Explain how the query works before printing the result.
    println!("\nDesk check for query [1,3]:");
    // Explain which original values participate in the query.
    println!("The range [1,3] includes values 1, 5, and 3.");
    // Explain the expected manual result.
    println!("Manual sum = 1 + 5 + 3 = 9.");
    // Run the query and store the result.
    let first_query_result = segment_tree.query(1, 3);
    // Print the query result returned by the segment tree.
    println!("Segment tree result for [1,3]: {}", first_query_result);

    // Explain the update operation before applying it.
    println!("\nDesk check for update index 2 -> 10:");
    // State the old and new value at index 2.
    println!("Index 2 changes from 5 to 10.");
    // Apply the update to the segment tree.
    segment_tree.update(2, 10);
    // Show the updated array values.
    println!("Updated array: {:?}", segment_tree.values);
    // Show the relevant tree nodes after the update.
    println!("Tree array after update: {:?}", &segment_tree.tree[1..10]);
    // Explain which nodes changed after the update.
    println!("Node 5 becomes 10, node 2 becomes 13, and node 1 becomes 20.");

    // Explain the same query after the update.
    println!("\nDesk check for query [1,3] after update:");
    // Explain the new values involved in the range.
    println!("The range [1,3] now includes values 1, 10, and 3.");
    // Explain the new expected manual result.
    println!("Manual sum = 1 + 10 + 3 = 14.");
    // Run the query again and store the result.
    let second_query_result = segment_tree.query(1, 3);
    // Print the query result after the update.
    println!("Segment tree result for [1,3] after update: {}", second_query_result);
}
