package com.dungeon_game.demo.models;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class DungeonResponse {
    private final UUID id;
    private final List<List<Integer>> game;
    private final int answer;
    private final long durationMs;
    private final Instant createdAt;

    public DungeonResponse(UUID id, List<List<Integer>> game, int answer, long durationMs, Instant createdAt) {
        this.id = id;
        this.game = game;
        this.answer = answer;
        this.durationMs = durationMs;
        this.createdAt = createdAt;
    }

    public UUID getId() { return id; }
    public List<List<Integer>> getGame() { return game; }
    public int getAnswer() { return answer; }
    public long getDurationMs() { return durationMs; }
    public Instant getCreatedAt() { return createdAt; }
}
