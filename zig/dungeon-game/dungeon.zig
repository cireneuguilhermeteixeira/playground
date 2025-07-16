const std = @import("std");

fn min(a: i32, b: i32) i32 {
    return if (a < b) a else b;
}

fn max(a: i32, b: i32) i32 {
    return if (a > b) a else b;
}

//TODO: Allow multidimensional array
pub fn calculateMinimumHP_v1(dungeon: anytype) !i32 {
    const m = dungeon.len;
    const n = dungeon[0].len;

    var dp = try std.heap.page_allocator.alloc([]i32, m);
    defer {
        for (dp) |row| std.heap.page_allocator.free(row);
        std.heap.page_allocator.free(dp);
    }

    for (dp) |*row| {
        row.* = try std.heap.page_allocator.alloc(i32, n);
    }

    var i: usize = m;
    while (i > 0) : (i -= 1) {
        var j: usize = n;
        while (j > 0) : (j -= 1) {
            const row = i - 1;
            const col = j - 1;
            const curr = dungeon[row][col];

            const min_health = blk: {
                if (row == m - 1 and col == n - 1) break :blk max(1, 1 - curr)
                else if (row == m - 1) break :blk max(1, dp[row][col + 1] - curr)
                else if (col == n - 1) break :blk max(1, dp[row + 1][col] - curr)
                else break :blk max(1, min(dp[row + 1][col], dp[row][col + 1]) - curr);
            };

            dp[row][col] = min_health;
        }
    }

    return dp[0][0];
}

test "calculateMinimumHP_v1: example 1" {
    const dungeon = [_][3]i32{
        [_]i32{-2, -3, 3},
        [_]i32{-5, -10, 1},
        [_]i32{10, 30, -5},
    };
    const result = try calculateMinimumHP_v1(dungeon);
    try std.testing.expectEqual(@as(i32, 7), result);
}

test "calculateMinimumHP_v1: example 2" {

    const dungeon = [_][1]i32{
        [_]i32{0},
    };
    const result = try calculateMinimumHP_v1(dungeon);
    try std.testing.expectEqual(@as(i32, 1), result);
}

test "calculateMinimumHP_v1: example 3" {
    const dungeon = [_][3]i32{
        [_]i32{ -2, -3, 3 },
        [_]i32{ -5, -10, 1 },
    };
    const result = try calculateMinimumHP_v1(dungeon);
    try std.testing.expectEqual(@as(i32, 6), result);
}


test "calculateMinimumHP_v1: example 4" {
    const dungeon = [_][4]i32{
        [_]i32{-1, -2, 3, -4},
        [_]i32{10, -5, -6, -7},
    };
    const result = try calculateMinimumHP_v1(dungeon);
    try std.testing.expectEqual(@as(i32, 10), result);
}