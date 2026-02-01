# Tasks: Damage System

**Input**: Design documents from `/specs/001-damage-system/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, quickstart.md ✓

**Tests**: Not requested - manual gameplay testing per spec

**Organization**: Tasks grouped by user story to enable independent implementation and testing

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label (US1, US2, US3) - only for user story phases

## Path Conventions

- **Single project**: `src/game/` at repository root (Phaser game structure)
- Paths reference existing codebase structure from plan.md

---

## Phase 1: Setup (Configuration)

**Purpose**: Add configuration constants needed by all user stories

- [ ] T001 Add ENEMY_HEALTH_CONFIG to src/game/config/GameConfig.ts with baseHealth, scaling, and hitFlash settings

---

## Phase 2: Foundational (Enemy Health Infrastructure)

**Purpose**: Core health system that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T002 Add health and maxHealth protected properties to Enemy base class in src/game/entities/Enemy.ts
- [ ] T003 Add initHealth(baseHealth, waveNumber) method to Enemy class in src/game/entities/Enemy.ts
- [ ] T004 Add isDead() method to Enemy class returning health <= 0 in src/game/entities/Enemy.ts

**Checkpoint**: Enemy health infrastructure ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Enemies Survive Multiple Hits (Priority: P1) 🎯 MVP

**Goal**: Replace instant enemy destruction with damage-based destruction where enemies can survive multiple hits

**Independent Test**: Shoot an enemy on Wave 1 - it should survive the first hit (flash) and die on the second hit (no powerups)

### Implementation for User Story 1

- [ ] T005 [US1] Add takeDamage(amount) method to Enemy class that reduces health in src/game/entities/Enemy.ts
- [ ] T006 [US1] Update projectile-enemy collision handler in src/game/scenes/GameScene.ts to use damage system instead of instant destroy
- [ ] T007 [US1] Modify collision handler to call enemy.takeDamage() with Math.floor(projectile.damage) in src/game/scenes/GameScene.ts
- [ ] T008 [US1] Modify collision handler to only destroy enemy and emit enemy-destroyed event when enemy.isDead() returns true in src/game/scenes/GameScene.ts
- [ ] T009 [US1] Add import for Enemy type in GameScene.ts if not already present

**Checkpoint**: Enemies now survive multiple hits based on health - core damage system functional

---

## Phase 4: User Story 2 - Damage Scales with Wave Difficulty (Priority: P2)

**Goal**: Enemy health increases with wave progression to maintain challenge as players collect damage powerups

**Independent Test**: Progress through waves 1, 5, and 10 - enemies should require increasingly more hits to destroy

### Implementation for User Story 2

- [ ] T010 [US2] Define BASE_HEALTH constant (2) in KlaedScout class in src/game/entities/KlaedScout.ts
- [ ] T011 [US2] Add import for ENEMY_HEALTH_CONFIG in src/game/systems/EnemySpawnerSystem.ts
- [ ] T012 [US2] Call enemy.initHealth() with baseHealth and currentWave after enemy creation in EnemySpawnerSystem.spawnFormation() in src/game/systems/EnemySpawnerSystem.ts

**Checkpoint**: Enemy health now scales with wave number - difficulty progression functional

---

## Phase 5: User Story 3 - Visual Damage Feedback (Priority: P3)

**Goal**: Players see clear visual feedback when enemies take damage but survive

**Independent Test**: Shoot an enemy that survives - a white flash effect should appear on hit

### Implementation for User Story 3

- [ ] T013 [US3] Add import for ENEMY_HEALTH_CONFIG in src/game/entities/Enemy.ts
- [ ] T014 [US3] Add triggerHitFlash() method to Enemy class that tints child sprites white for configured duration in src/game/entities/Enemy.ts
- [ ] T015 [US3] Update takeDamage() to call triggerHitFlash() when enemy survives (isDead() returns false) in src/game/entities/Enemy.ts

**Checkpoint**: Visual hit feedback now appears when enemies survive damage

---

## Phase 6: Polish & Validation

**Purpose**: Final verification and edge case handling

- [ ] T016 Verify bomb/screen-clear still instantly destroys all enemies (existing destroy() bypasses damage system)
- [ ] T017 Run quickstart.md verification checklist for all acceptance scenarios
- [ ] T018 Test edge cases: overkill damage, multi-hit same frame, off-screen cleanup

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - No dependencies on US1 (health init is independent of damage handling)
- **User Story 3 (P3)**: Depends on US1 (triggerHitFlash is called from takeDamage which is added in US1)

### Within Each User Story

- Core methods before integration code
- Enemy class changes before Scene/System changes
- Story complete before moving to next priority

### File Modification Summary

| File | Tasks |
|------|-------|
| src/game/config/GameConfig.ts | T001 |
| src/game/entities/Enemy.ts | T002, T003, T004, T005, T013, T014, T015 |
| src/game/entities/KlaedScout.ts | T010 |
| src/game/scenes/GameScene.ts | T006, T007, T008, T009 |
| src/game/systems/EnemySpawnerSystem.ts | T011, T012 |

---

## Parallel Opportunities

### Phase 2 Parallelization

Tasks T002, T003, T004 all modify Enemy.ts but add different methods - should be done sequentially in a single implementation session.

### User Story Parallelization

With multiple developers after Phase 2 completes:
- Developer A: User Story 1 (GameScene collision handler)
- Developer B: User Story 2 (EnemySpawnerSystem + KlaedScout)

US3 must wait for US1's takeDamage() method.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: Foundational (T002-T004)
3. Complete Phase 3: User Story 1 (T005-T009)
4. **STOP and VALIDATE**: Test that enemies survive multiple hits
5. Result: Core damage system functional

### Recommended Order (Single Developer)

1. T001: Configuration
2. T002-T004: Enemy health infrastructure
3. T005-T009: Damage application in collisions
4. T010-T012: Wave scaling
5. T013-T015: Visual feedback
6. T016-T018: Validation

### Incremental Delivery

1. Setup + Foundational → Health infrastructure ready
2. Add US1 → Core damage works → **Playable MVP!**
3. Add US2 → Difficulty scales → **Balanced progression!**
4. Add US3 → Visual polish → **Complete feature!**

---

## Notes

- No new assets required - uses existing Phaser sprite tinting
- All changes localized to 5 files
- Bomb/screen-clear behavior unchanged (uses destroy() directly)
- Performance: <0.1ms overhead per collision (simple arithmetic)
- Manual testing via gameplay - no test runner configured
