const std = @import("std");

pub const Coord = struct { r: usize, c: usize };


fn clearScreen() void {
    std.io.getStdOut().writer().print("\x1b[2J\x1b[H", .{}) catch {};
}


pub fn animatePath(dungeon: anytype, path: []const Coord) !void {
    const writer = std.io.getStdOut().writer();
    const m = dungeon.len;
    const n = dungeon[0].len;

    // Criar frame visual baseado na dungeon original
    var frame = try std.ArrayList([][]const u8).initCapacity(std.heap.page_allocator, m);
    defer {
        for (frame.items) |row| std.heap.page_allocator.free(row);
        frame.deinit();
    }

    for (dungeon) |row| {
        const new_row = try std.heap.page_allocator.alloc([]const u8, n);
        for (row, 0..) |cell, i| {
            new_row[i] = if (cell < 0) "⬛" else "⬜";
        }
        try frame.append(new_row);
    }

    clearScreen();

    for (path, 0..) |coord, i| {
        if (coord.r >= m or coord.c >= n) {
            break;
        }

        if (i > 0) {
            const prev = path[i - 1];
            if (prev.r < m and prev.c < n) {
                frame.items[prev.r][prev.c] = "🟩"; // path
            }
        }

        frame.items[coord.r][coord.c] = "🚶"; // hero

        clearScreen();
        for (frame.items) |line| {
            for (line) |cell| {
                try writer.print("{s} ", .{cell});
            }
            try writer.print("\n", .{});
        }

        std.time.sleep(150 * std.time.ns_per_ms); // animation
    }

    try writer.print("\n🏁 It arrived!\n", .{});
}
