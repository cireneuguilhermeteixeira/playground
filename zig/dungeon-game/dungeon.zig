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

    var grid = try std.heap.page_allocator.alloc([]Cell, m);
    defer {
        for (grid) |row| std.heap.page_allocator.free(row);
        std.heap.page_allocator.free(grid);
    }

    for (grid) |*row| {
        row.* = try std.heap.page_allocator.alloc(Cell, n);
    }

    var i: usize = m;
    while (i > 0) : (i -= 1) {
        var j: usize = n;
        while (j > 0) : (j -= 1) {
            const row = i - 1;
            const col = j - 1;
            const curr = dungeon[row][col];

            const cell = &grid[row][col];

            if (row == m - 1 and col == n - 1) {
                cell.cost = @max(1, 1 - curr);
                cell.direction = 'X';
            } else if (row == m - 1) {
                cell.cost = @max(1, grid[row][col + 1].cost - curr);
                cell.direction = '>';
            } else if (col == n - 1) {
                cell.cost = @max(1, grid[row + 1][col].cost - curr);
                cell.direction = 'v';
            } else {
                const down = grid[row + 1][col].cost;
                const right = grid[row][col + 1].cost;

                if (down < right) {
                    cell.cost = @max(1, down - curr);
                    cell.direction = 'v';
                } else {
                    cell.cost = @max(1, right - curr);
                    cell.direction = '>';
                }
            }
        }
    }

    std.debug.print("Vida mínima necessária: {}\n", .{grid[0][0].cost});
    std.debug.print("Caminho:\n", .{});

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
    std.debug.print("({d},{d}) [princesa]\n", .{ r, c });
    return grid[0][0].cost;
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