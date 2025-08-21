package com.dungeon_game.demo.models;

import com.vladmihalcea.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Type;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "dungeon_run")
public class DungeonRun {

    @Id
    @GeneratedValue
    private UUID id;

    /** O “jogo” (tabuleiro) como JSONB */
    @Type(JsonBinaryType.class)
    @Column(columnDefinition = "jsonb", nullable = false)
    private List<List<Integer>> game;

    /** A “resposta” (mínimo HP necessário) */
    @Column(nullable = false)
    private int answer;

    /** Tempo de execução do algoritmo (ms) */
    @Column(nullable = false)
    private long durationMs;

    /** Data/hora de criação (UTC) */
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    // getters/setters
    public UUID getId() { return id; }
    public List<List<Integer>> getGame() { return game; }
    public void setGame(List<List<Integer>> game) { this.game = game; }

    public int getAnswer() { return answer; }
    public void setAnswer(int answer) { this.answer = answer; }

    public long getDurationMs() { return durationMs; }
    public void setDurationMs(long durationMs) { this.durationMs = durationMs; }

    public Instant getCreatedAt() { return createdAt; }
}
