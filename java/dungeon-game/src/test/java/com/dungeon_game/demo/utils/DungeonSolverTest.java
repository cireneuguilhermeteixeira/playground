package com.dungeon_game.demo.utils;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class DungeonSolverTest {

    @Test
    void example1() {
        int[][] dungeon = {
                { -2, -3,  3 },
                { -5,-10,  1 },
                { 10, 30, -5 }
        };
        int result = DungeonSolver.calculateMinimumHP(dungeon);
        assertEquals(7, result);
    }

    @Test
    void example2() {
        int[][] dungeon = { { 0 } };
        int result = DungeonSolver.calculateMinimumHP(dungeon);
        assertEquals(1, result);
    }

    @Test
    void example3() {
        int[][] dungeon = {
                { -2, -3,  3 },
                { -5,-10,  1 }
        };
        int result = DungeonSolver.calculateMinimumHP(dungeon);
        assertEquals(6, result);
    }

    @Test
    void example4() {
        int[][] dungeon = {
                { -1, -2,  3, -4 },
                { 10, -5, -6, -7 }
        };
        int result = DungeonSolver.calculateMinimumHP(dungeon);
        assertEquals(10, result);
    }

    // Casos extras úteis:

    @Test
    void singlePositiveCell() {
        int[][] dungeon = { { 5 } };
        assertEquals(1, DungeonSolver.calculateMinimumHP(dungeon));
    }

    @Test
    void singleNegativeCell() {
        int[][] dungeon = { { -8 } };
        assertEquals(9, DungeonSolver.calculateMinimumHP(dungeon));
    }

    @Test
    void allPositive() {
        int[][] dungeon = {
                { 1, 2 },
                { 3, 4 }
        };
        assertEquals(1, DungeonSolver.calculateMinimumHP(dungeon));
    }

    @Test
    void allNegative() {
        int[][] dungeon = {
                { -1, -1 },
                { -1, -1 }
        };
        assertEquals(4, DungeonSolver.calculateMinimumHP(dungeon));
    }
}
