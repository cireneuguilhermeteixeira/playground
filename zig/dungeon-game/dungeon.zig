const std = @import("std");

fn min(a: i32, b: i32) i32 {
    return if (a < b) a else b;
}

fn max(a: i32, b: i32) i32 {
    return if (a > b) a else b;
}

const Cell = struct {
    cost: i32,
    direction: u8, // '→', '↓', 'X'
};

pub fn calculateMinimumHP_v1(dungeon: anytype) !i32 {
    const m = dungeon.len;
    const n = dungeon[0].len;

    var grid = try std.heap.page_allocator.alloc([]Cell, m + 1);
    defer {
        for (grid) |row| std.heap.page_allocator.free(row);
        std.heap.page_allocator.free(grid);
    }

    for (grid) |*row| {
        row.* = try std.heap.page_allocator.alloc(Cell, n + 1);
        for (row.*) |*cell| {
            cell.cost = std.math.maxInt(i32);
            cell.direction = '.';
        }
    }

    grid[m][n - 1].cost = 1;
    grid[m - 1][n].cost = 1;
    var i: usize = m;
    while (i > 0) : (i -= 1) {
        var j: usize = n;
        while (j > 0) : (j -= 1) {
            
            const row = i - 1;
            const col = j - 1;
            const curr = dungeon[row][col];
            const min_next = @min(grid[row + 1][col].cost, grid[row][col + 1].cost);
            const needed = @max(1, min_next - curr);


            grid[row][col].cost = needed;

            if (grid[row + 1][col].cost < grid[row][col + 1].cost)
                grid[row][col].direction = 'v'
            else
                grid[row][col].direction = '>';
        }
    }

    var r: usize = 0;
    var c: usize = 0;
    while (grid[r][c].direction != 'X') {
        std.debug.print("({d},{d}) -> ", .{ r, c });
        switch (grid[r][c].direction) {
            '>' => c += 1,
            'v' => r += 1,
            else => break,
        }
    }
    std.debug.print("({d},{d}) [end]\n", .{ r, c });
    return grid[0][0].cost;
}

test "calculateMinimumHP_v1: example 1" {
    const dungeon = [_][3]i32{
        [_]i32{-2, -3,  3},
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

// 2 x 3
// [   ?,       ?,      ?,     INT_MAX ]
// [   ?,       ?,      ?,       1     ]  ← dp[1][3] = 1
// [INT_MAX, INT_MAX,   1,     INT_MAX ]  ← dp[2][2] = 1

