const std = @import("std");
const v1 = @import("dungeon.zig");
const v2 = @import("dungeon2.zig");
const v3 = @import("dungeon3.zig");

// --- Sign the three prototypes here -----------------
inline fn algo_v1(d: anytype) !i32 { return v1.calculateMinimumHP_v1(d); }
inline fn algo_v2(d: anytype) !i32 { return v2.calculateMinimumHP_v2(d); }
inline fn algo_v3(d: anytype) !i32 { return v3.calculateMinimumHP_v3(d); }
// ----------------------------------------------------

// 3 x 3
const dungeon3 = [_][3]i32{
    [_]i32{-2, -3, 3},
    [_]i32{-5, -10, 1},
    [_]i32{10, 30, -5},
};

// 5 × 5
const dungeon5 = [_][5]i32{
    [_]i32{ 1, -3,  2, -5, -2},
    [_]i32{-4, -6,  0,  3, -8},
    [_]i32{ 5,  1, -9, -2, -1},
    [_]i32{-3,  4,  6, -7,  2},
    [_]i32{ 0, -5,  2,  1, -4},
};

// 10 × 10
const dungeon10 = [_][10]i32{
    [_]i32{  0, -4, 10,-12,  3, -2, -8,  6, -7,  1},
    [_]i32{ -5, -9, -1,  4,-17, 19, -3,  0, 12,-11},
    [_]i32{  8, -6,  2,  1, -4,  3,-20, -7,  5, -2},
    [_]i32{ -3, 15, -2, -8,  6, -1,  4,-10, -5,  9},
    [_]i32{ 16, -7, -9,  2,-13, -4,  0,  8, -6, -3},
    [_]i32{ -1,  5, 11,-14,  7, -8,  3, -2,  6,-15},
    [_]i32{  4, -3,  9, -5,  2,-16,  1, -6, 10, -2},
    [_]i32{  0, -4, -8,  7, -1,  5,-11,  2, -3,  6},
    [_]i32{-12,  3, -2,  4,  8, -9, 14, -5, -7,  0},
    [_]i32{  6, -1,  2,-18, -4, 11, -6,  9, -3, 13},
};




fn benchOne(comptime name_algo: []const u8,
            comptime name_dun:  []const u8,
            func: anytype,
            dungeon: anytype) !void
{
    var timer = try std.time.Timer.start();
    const reps = 100_000;
    var acc: i32 = 0;

    var i: usize = reps;
    while (i > 0) : (i -= 1) {
        acc += try func(dungeon);
    }

    const ns_total = timer.read();
    std.mem.doNotOptimizeAway(acc);
    std.debug.print("{s} / {s}: {d} ns/op (avg over {d})\n",
        .{ name_algo, name_dun, ns_total / reps, reps });
}


pub fn main() !void {
    // Dynamic Programming
    // ---------- v1 ----------
    try benchOne("v1", "3 x 3",  algo_v1, dungeon3);
    try benchOne("v1", "5 x 5",  algo_v1, dungeon5);
    try benchOne("v1", "10 x 10", algo_v1, dungeon10);

    // ---------- v2 ----------
    try benchOne("v2", "3 x 3",  algo_v2, dungeon3);
    try benchOne("v2", "5 x 5",  algo_v2, dungeon5);
    try benchOne("v2", "10 x 10", algo_v2, dungeon10);

    // ---------- v3 ----------
    try benchOne("v3", "3 x 3",  algo_v3, dungeon3);
    try benchOne("v3", "5 x 5",  algo_v3, dungeon5);
    try benchOne("v3", "10 x 10", algo_v3, dungeon10);
}