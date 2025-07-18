const std = @import("std");
const animation = @import("animation.zig");
const Coord = animation.Coord;


fn min(a: i32, b: i32) i32 {
    return if (a < b) a else b;
}

fn max(a: i32, b: i32) i32 {
    return if (a > b) a else b;
}

const Cell = struct {
    cost: i32,
    direction: u8,  // '>', 'v', 'X'
};


pub fn calculateMinimumHP_v1(dungeon: anytype) !i32 {
    const allocator = std.heap.page_allocator;
    const m = dungeon.len;
    const n = dungeon[0].len;

    var grid = try allocator.alloc([]Cell, m + 1);
    defer {
        for (grid) |row| allocator.free(row);
        allocator.free(grid);
    }

    for (grid) |*row| {
        row.* = try allocator.alloc(Cell, n + 1);
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

    // Allocating the path
    var path = std.ArrayList(Coord).init(allocator);
    defer path.deinit();

    var r: usize = 0;
    var c: usize = 0;
    try path.append(.{ .r = r, .c = c });

    while (grid[r][c].direction != 'X') {
        switch (grid[r][c].direction) {
            '>' => c += 1,
            'v' => r += 1,
            else => break,
        }
        try path.append(.{ .r = r, .c = c });
    }

    // Call animation
    try animation.animatePath(dungeon, path.items);

    return grid[0][0].cost;
}