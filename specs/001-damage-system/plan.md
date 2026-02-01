# Implementation Plan: Damage System

**Branch**: `001-damage-system` | **Date**: 2026-02-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-damage-system/spec.md`

## Summary

Replace instant enemy destruction with a health-based damage system. Enemies will have health points that scale with wave progression, player projectiles will deal damage based on the damage multiplier powerup, and visual hit feedback will indicate damage without destruction. The implementation integrates with existing wave scaling, collision handling, and powerup systems while maintaining 60 FPS performance.

## Technical Context

**Language/Version**: TypeScript 5.x
**Primary Dependencies**: Phaser 3.90.0 (Arcade Physics)
**Storage**: N/A (in-memory enemy health state)
**Testing**: Manual gameplay testing (no test runner configured)
**Target Platform**: Modern browsers (ES2020), Mobile Safari/Chrome
**Project Type**: Single (Phaser game)
**Performance Goals**: 60 FPS with 20+ enemies tracking health state
**Constraints**: <4ms per frame for damage system logic, no new asset requirements
**Scale/Scope**: Single enemy type (KlaedScout) initially, extensible to future enemy types

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| **I. Performance First** | ✅ PASS | Health tracking is O(1) per enemy, no new allocations in collision handler, damage calculation is simple arithmetic |
| **II. Clean Architecture** | ✅ PASS | Health added to Enemy base class, damage logic in collision handler, wave scaling via existing event system |
| **III. Incremental Features** | ✅ PASS | Extends Enemy class without modifying unrelated systems, integrates via existing events |
| **IV. Player Experience** | ✅ PASS | Visual hit feedback (tint flash) provides clear damage indication, existing destruction behavior preserved |
| **V. Code Quality** | ✅ PASS | TypeScript strict mode, follows existing patterns (Container-based entities, event-driven communication) |

**No violations requiring justification.**

## Project Structure

### Documentation (this feature)

```text
specs/001-damage-system/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (N/A - no API contracts for game feature)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/game/
├── entities/
│   ├── Enemy.ts              # MODIFY: Add health property, takeDamage(), isDead()
│   └── KlaedScout.ts         # MODIFY: Set base health constant
├── scenes/
│   └── GameScene.ts          # MODIFY: Update collision handler to use damage system
├── systems/
│   └── EnemySpawnerSystem.ts # MODIFY: Apply wave-scaled health on spawn
└── config/
    └── GameConfig.ts         # MODIFY: Add enemy health configuration constants
```

**Structure Decision**: Single project structure preserved. Changes are localized to enemy entities, collision handling, and configuration.

## Complexity Tracking

> No violations - table not applicable.
