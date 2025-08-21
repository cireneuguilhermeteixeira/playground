package com.dungeon_game.demo.models;

public class DungeonResponse {
    private int minimumHp;

    public DungeonResponse(int minimumHp) {
        this.minimumHp = minimumHp;
    }

    public int getMinimumHp() {
        return minimumHp;
    }

    public void setMinimumHp(int minimumHp) {
        this.minimumHp = minimumHp;
    }
}