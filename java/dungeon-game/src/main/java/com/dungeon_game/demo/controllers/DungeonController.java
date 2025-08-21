package com.dungeon_game.demo.controllers;
import com.dungeon_game.demo.models.DungeonRequest;
import com.dungeon_game.demo.models.DungeonResponse;
import com.dungeon_game.demo.models.DungeonRun;
import com.dungeon_game.demo.service.DungeonService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/dungeon")
public class DungeonController {

    private final DungeonService service;

    public DungeonController(DungeonService service) {
        this.service = service;
    }

    @PostMapping("/min-hp")
    public ResponseEntity<DungeonResponse> minHp(@RequestBody DungeonRequest body) {
        try {
            body.validate();
            DungeonRun saved = service.solveAndPersist(body.getDungeon());
            DungeonResponse response = new DungeonResponse(
                saved.getId(),
                saved.getGame(),
                saved.getAnswer(),
                saved.getDurationMs(),
                saved.getCreatedAt()
            );
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/runs")
    public List<DungeonResponse> getAll() {
        return service.findAllRuns();
    }

    @GetMapping("/runs/{id}")
    public ResponseEntity<DungeonResponse> getById(@PathVariable UUID id) {
        return service.findRunById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}