package com.dungeon_game.demo.utils;

public final class DungeonSolver {

    public static int calculateMinimumHP(int[][] dungeon) {
        if (dungeon == null || dungeon.length == 0 || dungeon[0].length == 0) {
            return 1;
        }

        final int m = dungeon.length;
        final int n = dungeon[0].length;

        // dp tem (m+1) x (n+1) com "sentinelas" em +∞ (aqui usamos Integer.MAX_VALUE/2 para evitar overflow)
        final int INF = Integer.MAX_VALUE / 4;
        int[][] dp = new int[m + 1][n + 1];

        for (int i = 0; i <= m; i++) {
            for (int j = 0; j <= n; j++) {
                dp[i][j] = INF;
            }
        }

        dp[m][n - 1] = 1;
        dp[m - 1][n] = 1;

        for (int i = m - 1; i >= 0; i--) {
            for (int j = n - 1; j >= 0; j--) {
                int minNext = Math.min(dp[i + 1][j], dp[i][j + 1]);
                int needed = Math.max(1, minNext - dungeon[i][j]);
                dp[i][j] = needed;
            }
        }

        return dp[0][0];
    }
}
