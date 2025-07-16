// zig build-exe benchmark.zig dungeon.zig dungeon2.zig dungeon3.zig -O ReleaseFas
const std = @import("std");
const v1 = @import("dungeon.zig");
const v2 = @import("dungeon2.zig");
const v3 = @import("dungeon3.zig");

// --- Sign the three prototypes here -----------------
inline fn algo_v1(d: anytype) !i32 { return v1.calculateMinimumHP_v1(d); }
inline fn algo_v2(d: anytype) !i32 { return v2.calculateMinimumHP_v2(d); }
inline fn algo_v3(d: anytype) !i32 { return v3.calculateMinimumHP_v3(d); }
// ----------------------------------------------------

const dungeon = [_][3]i32{
    [_]i32{-2, -3, 3},
    [_]i32{-5, -10, 1},
    [_]i32{10, 30, -5},
};

fn bench(comptime name: []const u8, func: anytype) !void {
    var timer = try std.time.Timer.start();
    const reps = 1_000_000;
    var acc: i32 = 0;

    var i: usize = reps;
    while (i > 0) : (i -= 1) {
        acc += try func(&dungeon);
    }

    const ns = timer.read();
    std.mem.doNotOptimizeAway(acc);
    std.debug.print("{s}: {d} ns/op (avg over {d})\n",
        .{ name, ns / reps, reps });
}

pub fn main() !void {
    try bench("v1", algo_v1);
    try bench("v2", algo_v2);
    try bench("v3", algo_v3);
}
