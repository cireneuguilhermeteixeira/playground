package com.dungeon_game.demo.service;

import com.dungeon_game.demo.models.DungeonResponse;
import com.dungeon_game.demo.models.DungeonRun;
import com.dungeon_game.demo.repo.DungeonRunRepository;
import com.dungeon_game.demo.utils.DungeonSolver;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

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
        run.setGame(board);
        run.setAnswer(answer);
        run.setDurationMs(durationMs);

        return repo.save(run);
    }

    public List<DungeonResponse> findAllRuns() {
        return repo.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public Optional<DungeonResponse> findRunById(UUID id) {
        return repo.findById(id).map(this::toResponse);
    }

    private DungeonResponse toResponse(DungeonRun run) {
        return new DungeonResponse(
                run.getId(),
                run.getGame(),
                run.getAnswer(),
                run.getDurationMs(),
                run.getCreatedAt()
        );
    }
}
