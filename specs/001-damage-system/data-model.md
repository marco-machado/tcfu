# Data Model: Damage System

**Feature**: 001-damage-system | **Date**: 2026-02-01

## Entities

### Enemy (Modified)

**File**: `src/game/entities/Enemy.ts`

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| health | number | Current health points | >= 0 |
| maxHealth | number | Maximum health points (set on spawn) | >= 1 |

**Methods**:

| Method | Signature | Description |
|--------|-----------|-------------|
| initHealth | `(baseHealth: number, waveNumber: number) => void` | Sets maxHealth = baseHealth + (waveNumber - 1), health = maxHealth |
| takeDamage | `(amount: number) => void` | Reduces health by amount, triggers hit flash if alive |
| isDead | `() => boolean` | Returns true if health <= 0 |
| triggerHitFlash | `() => void` | Applies red tint (0xff4444) to child sprites for 200ms with scale bounce effect |

**State Transitions**:

```
┌─────────────┐      spawn()       ┌─────────────┐
│  Not Exist  │ ──────────────────>│   Alive     │
└─────────────┘                    │ health > 0  │
                                   └──────┬──────┘
                                          │
                                   takeDamage(n)
                                   health > 0
                                          │
                                          ▼
                                   ┌─────────────┐
                                   │  Damaged    │
                                   │ (hit flash) │
                                   └──────┬──────┘
                                          │
                                   takeDamage(n)
                                   health <= 0
                                          │
                                          ▼
                                   ┌─────────────┐
                                   │   Dead      │──► destroy() + enemy-destroyed event
                                   │ health <= 0 │
                                   └─────────────┘
```

---

### KlaedScout (Modified)

**File**: `src/game/entities/KlaedScout.ts`

| Constant | Value | Description |
|----------|-------|-------------|
| BASE_HEALTH | 2 | Health on Wave 1 (from ENEMY_HEALTH_CONFIG) |

No additional fields - inherits health management from Enemy base class.

---

### PlayerProjectile (Unchanged)

**File**: `src/game/entities/weapons/PlayerProjectile.ts`

| Field | Type | Description | Usage |
|-------|------|-------------|-------|
| damage | number (readonly) | Damage multiplier value | Read in collision handler |

Existing field, now actively used in damage calculation.

---

## Configuration

### ENEMY_HEALTH_CONFIG (New)

**File**: `src/game/config/GameConfig.ts`

```typescript
export const ENEMY_HEALTH_CONFIG = {
    klaedScout: {
        baseHealth: 2,           // HP on Wave 1
    },
    scaling: {
        healthPerWave: 1,        // +1 HP per wave
    },
    hitFlash: {
        tintColor: 0xff4444,     // Red tint for better contrast on dark sprites
        duration: 200,           // milliseconds (12 frames at 60fps)
        flashAlpha: 0.4,         // Alpha value during flash
        scaleBounce: 0.15,       // Scale multiplier for bounce effect
    },
}
```

---

## Relationships

```
┌──────────────────────────────────────────────────────────────────────┐
│                           GameScene                                   │
│  ┌─────────────────┐                         ┌───────────────────┐   │
│  │ PlayerWeapons   │──creates──►             │ EnemySpawner      │   │
│  │ System          │          │              │ System            │   │
│  └────────┬────────┘          │              └─────────┬─────────┘   │
│           │                   │                        │             │
│           ▼                   │                        ▼             │
│  ┌─────────────────┐          │              ┌───────────────────┐   │
│  │ PlayerProjectile│          │              │ Enemy             │   │
│  │ .damage: number │──────────┼──overlap────►│ .health: number   │   │
│  └─────────────────┘          │              │ .takeDamage()     │   │
│                               │              │ .isDead()         │   │
│                               │              └─────────┬─────────┘   │
│                               │                        │             │
│                               │                        │ extends     │
│                               │                        ▼             │
│                               │              ┌───────────────────┐   │
│                               │              │ KlaedScout        │   │
│                               │              │ BASE_HEALTH = 2   │   │
│                               └──────────────┴───────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Validation Rules

### Health Initialization
- `baseHealth` must be >= 1
- `waveNumber` must be >= 1
- `maxHealth = baseHealth + (waveNumber - 1)` is always >= baseHealth

### Damage Application
- `amount` is ceiled during calculation: `Math.ceil(baseDamage * damageMultiplier)`
- Minimum damage per hit is 1 (base damage with no powerups)
- Health cannot go below 0 (clamped in logic, but isDead() check handles negative)

### Wave Scaling Formula
```
enemyHealth = ENEMY_HEALTH_CONFIG.klaedScout.baseHealth
            + (currentWave - 1) * ENEMY_HEALTH_CONFIG.scaling.healthPerWave
```

| Wave | Calculation | KlaedScout HP |
|------|-------------|---------------|
| 1 | 2 + (1-1)*1 | 2 |
| 2 | 2 + (2-1)*1 | 3 |
| 5 | 2 + (5-1)*1 | 6 |
| 10 | 2 + (10-1)*1 | 11 |
| 20 | 2 + (20-1)*1 | 21 |

### Damage Multiplier Stacks
```
finalDamage = ceil(baseDamage × damageMultiplier)
```

| Stacks | Multiplier | ceil(1 × mult) |
|--------|------------|----------------|
| 0 | 1.0 | 1 |
| 1 | 1.5 | 2 |
| 2 | 2.25 | 3 |
| 3 | 3.375 | 4 |

### Combat Examples

**Wave 1, No Powerups**:
- Enemy HP: 2
- Damage per shot: 1
- Hits to kill: 2

**Wave 1, 3 Damage Stacks**:
- Enemy HP: 2
- Damage per shot: 3
- Hits to kill: 1

**Wave 10, No Powerups**:
- Enemy HP: 11
- Damage per shot: 1
- Hits to kill: 11

**Wave 10, 3 Damage Stacks**:
- Enemy HP: 11
- Damage per shot: 3
- Hits to kill: 4 (3+3+3+2=11)
