const std = @import("std");
const dungeon = @import("dungeon.zig");

pub fn main() !void {
    const dungeonArray = [_][3]i32{
        [_]i32{ -2, -3, 3 },
        [_]i32{ -5, -10, 1 },
        [_]i32{ 10, 30, -5 },
    };

    const result = try dungeon.calculateMinimumHP_v1(dungeonArray);
    std.debug.print("Minimum initial health: {}\n", .{result});

}
