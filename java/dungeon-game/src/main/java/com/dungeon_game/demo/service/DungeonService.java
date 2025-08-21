package com.dungeon_game.demo.service;

import com.dungeon_game.demo.models.DungeonRun;
import com.dungeon_game.demo.repo.DungeonRunRepository;
import com.dungeon_game.demo.utils.DungeonSolver;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
public class DungeonService {

    private final DungeonRunRepository repo;

    public DungeonService(DungeonRunRepository repo) {
        this.repo = repo;
    }

    public DungeonRun solveAndPersist(int[][] dungeon) {
        long t0 = System.nanoTime();
        int answer = DungeonSolver.calculateMinimumHP(dungeon);
        long t1 = System.nanoTime();
        long durationMs = Math.max(0, (t1 - t0) / 1_000_000);

        // int[][] -> List<List<Integer>> para JSONB
        List<List<Integer>> board = Arrays.stream(dungeon)
                .map(row -> Arrays.stream(row).boxed().toList())
                .toList();

        DungeonRun run = new DungeonRun();
        run.setGame(board);        // JOGO
        run.setAnswer(answer);     // RESPOSTA
        run.setDurationMs(durationMs); // TEMPO

        return repo.save(run);     // CREATED_AT preenchido pelo Hibernate
    }
}
