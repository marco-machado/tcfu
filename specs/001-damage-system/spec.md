# Feature Specification: Damage System

**Feature Branch**: `001-damage-system`
**Created**: 2026-02-01
**Status**: Draft
**Input**: User description: "Replace instant destruction with damage system"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Enemies Survive Multiple Hits (Priority: P1)

Players encounter enemies that require multiple hits to destroy, creating more engaging combat. Different enemy types have varying health pools, making some enemies feel tougher than others. Players can see visual feedback when enemies take damage but don't die.

**Why this priority**: This is the core mechanic change. Without enemies having health points, the damage system has no purpose. This enables strategic gameplay where players must focus fire on tougher enemies.

**Independent Test**: Can be fully tested by shooting an enemy and verifying it survives the first hit, then dies after enough damage. Delivers immediate gameplay value by making combat more tactical.

**Acceptance Scenarios**:

1. **Given** the player is in gameplay with a basic enemy on screen, **When** the player shoots the enemy once, **Then** the enemy takes damage but remains alive if the damage dealt is less than its health
2. **Given** an enemy has taken damage but is still alive, **When** the player deals damage equal to or greater than the enemy's remaining health, **Then** the enemy is destroyed
3. **Given** an enemy takes damage, **When** it survives the hit, **Then** there is visible feedback indicating damage was taken (hit flash effect)

---

### User Story 2 - Damage Scales with Wave Difficulty (Priority: P2)

As players progress to higher waves, enemy health pools increase, maintaining challenge even as players collect damage powerups. This creates a natural difficulty curve where early waves feel accessible and later waves require sustained fire.

**Why this priority**: Balances the existing wave progression system. Without health scaling, the damage powerups would quickly make the game trivially easy.

**Independent Test**: Can be tested by progressing through several waves and observing that enemies require more hits to destroy in later waves compared to wave 1.

**Acceptance Scenarios**:

1. **Given** the player is on Wave 1, **When** a basic enemy spawns, **Then** it has the base health value
2. **Given** the player progresses to a higher wave, **When** enemies spawn, **Then** their health is increased according to the wave scaling formula
3. **Given** the player has damage powerups, **When** they shoot enemies on higher waves, **Then** the powerups offset some of the increased enemy health

---

### User Story 3 - Visual Damage Feedback (Priority: P3)

Players receive clear visual feedback when they damage enemies, helping them understand combat effectiveness. This includes hit effects when damage is dealt and visual indicators for enemies that have taken significant damage.

**Why this priority**: Enhances player understanding and satisfaction. Without visual feedback, players may not realize they're dealing damage to multi-hit enemies.

**Independent Test**: Can be tested by shooting an enemy and verifying visible effects appear when damage is dealt.

**Acceptance Scenarios**:

1. **Given** the player shoots an enemy, **When** the projectile hits, **Then** a visual hit effect plays on the enemy
2. **Given** an enemy has taken damage, **When** it survives with reduced health, **Then** the enemy shows visual indication of damage (tint or flash)
3. **Given** an enemy is destroyed, **When** its health reaches zero, **Then** the existing destruction behavior occurs (enemy removed, score awarded, potential powerup drop)

---

### Edge Cases

- What happens when an enemy with 2 health is hit by a projectile dealing 3 damage? → Enemy dies, excess damage is ignored
- What happens when multiple projectiles hit an enemy in the same frame? → All damage is applied, enemy dies if total exceeds health
- How does the bomb (screen clear) interact with enemy health? → Bomb instantly destroys all enemies regardless of health
- What happens if an enemy reaches the bottom of the screen with remaining health? → Enemy is removed as normal (cleanup behavior unchanged)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Enemies MUST have a health point value that determines how much damage they can take before being destroyed
- **FR-002**: Player projectiles MUST deal damage to enemies instead of instantly destroying them
- **FR-003**: Enemies MUST be destroyed when their health reaches zero or below
- **FR-004**: The damage multiplier powerup MUST increase the damage dealt by player projectiles. Final damage = ceil(base_damage × multiplier), rounding up fractional values to ensure immediate impact.
- **FR-005**: Enemy health MUST scale with wave progression to maintain challenge
- **FR-006**: Enemies MUST display a visual hit effect when taking damage but surviving
- **FR-007**: The bomb/screen-clear ability MUST instantly destroy all enemies regardless of their remaining health
- **FR-008**: Score awarded for destroying enemies MUST remain unchanged (based on enemy type, not damage dealt)
- **FR-009**: Powerup drop chance on enemy death MUST remain unchanged
- **FR-010**: Enemy projectiles hitting the player MUST continue to deal damage as a single hit (no change to player damage model)

### Key Entities

- **Enemy Health**: A numeric value representing how much damage an enemy can absorb. Each enemy type defines a base health value. Current health is tracked per enemy instance.
- **Damage Value**: The amount of health points removed when a projectile hits an enemy. Base damage is 1, modified by the damage multiplier powerup.
- **Wave Health Scaling**: Linear formula: `enemy_health = base_health + (wave_number - 1)` where `base_health` is defined per enemy type (e.g., KlaedScout = 2). Wave 1 = base health, Wave 10 = base health + 9.
- **Damage Calculation**: Final damage = `ceil(base_damage × damage_multiplier)`. Fractional values always round up to ensure the first damage powerup provides immediate 2 damage (not 1).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Basic enemies on Wave 1 survive at least 1 hit from a base-damage projectile
- **SC-002**: Players can visually distinguish between damaging an enemy and destroying an enemy
- **SC-003**: Enemies on Wave 10 require noticeably more hits to destroy than enemies on Wave 1
- **SC-004**: All existing powerups continue to function as documented (fire rate, spread shot, damage multiplier, etc.)
- **SC-005**: Game maintains 60 FPS with 20+ enemies on screen, each tracking health state (per constitution Performance First principle)
- **SC-006**: Bomb ability clears all enemies in under 0.5 seconds regardless of their health values

## Clarifications

### Session 2026-02-01

- Q: What should be the base health value for the KlaedScout enemy on Wave 1? → A: 2 HP (dies in 2 base hits)
- Q: How should enemy health scale with wave progression? → A: Linear: +1 HP per wave
- Q: How should fractional damage from stacked multipliers be handled? → A: Ceil (round up) to ensure immediate impact from first damage powerup (1×1.5 = 1.5 → ceil = 2)

## Assumptions

- KlaedScout base health is 2 HP on Wave 1, requiring 2 hits with base damage to destroy
- Health scaling is linear: +1 HP per wave (Wave 1 = 2 HP, Wave 10 = 11 HP for KlaedScout)
- Damage uses floor rounding: 1 base × 1.5x multiplier = 1 damage (not 2)
- The existing damage multiplier powerup (up to 3 stacks, 1.5x per stack) will directly multiply projectile damage
- Hit visual feedback will use a simple tint flash (no new sprite assets required)
- Enemy health bars are NOT in scope for this feature (may be a future enhancement)
