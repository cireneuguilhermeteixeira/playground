package com.dungeon_game.demo.controllers;
import com.dungeon_game.demo.models.DungeonRequest;
import com.dungeon_game.demo.models.DungeonResponse;
import com.dungeon_game.demo.utils.DungeonSolver;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dungeon")
public class DungeonController {

    @PostMapping("/min-hp")
    public ResponseEntity<DungeonResponse> minHp(@RequestBody DungeonRequest body) {
        try {
            body.validate();
            int result = DungeonSolver.calculateMinimumHP(body.getDungeon());
            return ResponseEntity.ok(new DungeonResponse(result));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().build();
        }
    }
}