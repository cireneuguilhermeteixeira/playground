package com.dungeon_game.demo.models;

import java.util.Arrays;

public class DungeonRequest {
    private int[][] dungeon;

    public int[][] getDungeon() {
        return dungeon;
    }
    public void setDungeon(int[][] dungeon) {
        this.dungeon = dungeon;
    }

    public void validate() {
        if (dungeon == null || dungeon.length == 0) {
            throw new IllegalArgumentException("O campo 'dungeon' não pode ser vazio.");
        }
        int cols = dungeon[0].length;
        if (cols == 0) throw new IllegalArgumentException("O tabuleiro deve ter ao menos 1 coluna.");
        for (int i = 1; i < dungeon.length; i++) {
            if (dungeon[i].length != cols) {
                throw new IllegalArgumentException("Todas as linhas devem ter o mesmo tamanho. Linha " + i + " difere.");
            }
        }
    }

    @Override
    public String toString() {
        return "DungeonRequest{dungeon=" + Arrays.deepToString(dungeon) + "}";
    }
}
