// src/main/java/com/dungeon_game/demo/repo/DungeonRunRepository.java
package com.dungeon_game.demo.repo;

import com.dungeon_game.demo.models.DungeonRun;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface DungeonRunRepository extends JpaRepository<DungeonRun, UUID> {}
