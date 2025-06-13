const std = @import("std");

fn min(a: i32, b: i32) i32 {
    return if (a < b) a else b;
}

fn max(a: i32, b: i32) i32 {
    return if (a > b) a else b;
}


pub fn calculateMinimumHP(dungeon: [][]i32) i32 {
    const m = dungeon.len;
    const n = dungeon[0].len;

    var dp = try std.heap.page_allocator.alloc([]i32, m);
    defer std.heap.page_allocator.free(dp);

    for (dp) |*row, i| {
        row.* = try std.heap.page_allocator.alloc(i32, n);
        defer std.heap.page_allocator.free(row.*);
    }

    for (m - 1..0).rev() |i| {
        for (n - 1..0).rev() |j| {
            const curr = dungeon[i][j];
            const min_health = blk: {
                if (i == m - 1 and j == n - 1) break :blk max(1, 1 - curr)
                else if (i == m - 1) break :blk max(1, dp[i][j + 1] - curr)
                else if (j == n - 1) break :blk max(1, dp[i + 1][j] - curr)
                else break :blk max(1, min(dp[i + 1][j], dp[i][j + 1]) - curr)
            };
            dp[i][j] = min_health;
        }
    }

    return dp[0][0];
}

test "calculateMinimumHP: example 1" {
    const dungeon = &[_][]i32{
        &[_]i32{-2, -3, 3},
        &[_]i32{-5, -10, 1},
        &[_]i32{10, 30, -5},
    };
    const result = calculateMinimumHP(dungeon);
    try std.testing.expectEqual(@as(i32, 7), result);
}

test "calculateMinimumHP: example 2" {
    const dungeon = &[_][]i32{
        &[_]i32{0},
    };
    const result = calculateMinimumHP(dungeon);
    try std.testing.expectEqual(@as(i32, 1), result);
}
