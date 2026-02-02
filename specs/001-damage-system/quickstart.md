# Quickstart: Damage System

**Feature**: 001-damage-system | **Date**: 2026-02-01

## Overview

This guide provides the minimal path to implementing the damage system feature. Follow these steps in order.

---

## Prerequisites

- [ ] Read `spec.md` for requirements and acceptance criteria
- [ ] Read `research.md` for technical decisions
- [ ] Read `data-model.md` for entity structure

---

## Implementation Steps

### Step 1: Add Configuration

**File**: `src/game/config/GameConfig.ts`

Add after existing config exports:

```typescript
export const ENEMY_HEALTH_CONFIG = {
    klaedScout: {
        baseHealth: 2,
    },
    scaling: {
        healthPerWave: 1,
    },
    hitFlash: {
        tintColor: 0xffffff,
        duration: 100,
    },
}
```

---

### Step 2: Add Health to Enemy Base Class

**File**: `src/game/entities/Enemy.ts`

Add properties and methods to the Enemy class:

```typescript
export class Enemy extends Phaser.GameObjects.Container {
    protected health: number = 1
    protected maxHealth: number = 1

    initHealth(baseHealth: number, waveNumber: number): void {
        this.maxHealth = baseHealth + (waveNumber - 1)
        this.health = this.maxHealth
    }

    takeDamage(amount: number): void {
        this.health -= amount
        if (!this.isDead()) {
            this.triggerHitFlash()
        }
    }

    isDead(): boolean {
        return this.health <= 0
    }

    triggerHitFlash(): void {
        const tintColor = ENEMY_HEALTH_CONFIG.hitFlash.tintColor
        const duration = ENEMY_HEALTH_CONFIG.hitFlash.duration

        this.getAll().forEach(child => {
            if (child instanceof Phaser.GameObjects.Sprite) {
                child.setTint(tintColor)
            }
        })

        this.scene.time.delayedCall(duration, () => {
            if (this.active) {
                this.getAll().forEach(child => {
                    if (child instanceof Phaser.GameObjects.Sprite) {
                        child.clearTint()
                    }
                })
            }
        })
    }
}
```

---

### Step 3: Initialize Health on Spawn

**File**: `src/game/systems/EnemySpawnerSystem.ts`

In `spawnFormation()`, after creating the enemy:

```typescript
const enemy = new KlaedScout(this.scene)
enemy.initHealth(ENEMY_HEALTH_CONFIG.klaedScout.baseHealth, this.currentWave)
```

Import the config at the top of the file.

---

### Step 4: Update Collision Handler

**File**: `src/game/scenes/GameScene.ts`

Replace the projectile-enemy overlap callback (around line 176):

```typescript
this.projectileEnemyOverlap = this.physics.add.overlap(
    this.playerProjectilesGroup,
    this.enemiesGroup,
    (obj1, obj2) => {
        try {
            const projectile = obj1 as PlayerProjectile
            const enemy = obj2 as Enemy

            const enemyX = enemy.x
            const enemyY = enemy.y

            // Apply damage
            const damage = Math.floor(projectile.damage)
            enemy.takeDamage(damage)

            // Always destroy the projectile
            projectile.destroy()

            // Check if enemy died
            if (enemy.isDead()) {
                enemy.destroy()
                this.events.emit('enemy-destroyed', {
                    points: GAME_STATE_CONFIG.scorePerEnemy,
                    x: enemyX,
                    y: enemyY,
                })
            }
        } catch (error) {
            console.error('Error in projectile-enemy collision:', error)
        }
    }
)
```

Import Enemy type if not already imported.

---

## Verification Checklist

After implementation, verify each acceptance scenario:

### User Story 1: Enemies Survive Multiple Hits
- [ ] Wave 1 enemy survives first hit (no powerups)
- [ ] Wave 1 enemy dies on second hit (no powerups)
- [ ] Hit flash appears when enemy takes damage but survives

### User Story 2: Damage Scales with Wave
- [ ] Wave 1 enemies: 2 HP
- [ ] Wave 5 enemies: 6 HP
- [ ] Wave 10 enemies: 11 HP
- [ ] Damage powerups reduce hits required

### User Story 3: Visual Feedback
- [ ] White flash on hit (100ms duration)
- [ ] Existing destruction behavior preserved
- [ ] Score still awards 100 points per enemy

### Edge Cases
- [ ] Overkill damage: Enemy dies normally
- [ ] Multi-hit same frame: All damage applied
- [ ] Bomb clears all enemies instantly
- [ ] Off-screen enemies still cleaned up

---

## Debug Tips

Enable debug mode in `GameConfig.ts` (`GAME_CONFIG.debug = true`) to access:
- Keys 1-0: Spawn specific powerups
- Use Key 5 (DamageUp) to test damage stacking

Monitor enemy health in browser console by adding temporary logging:
```typescript
console.log(`Enemy hit: ${damage} damage, ${enemy.health - damage} HP remaining`)
```

---

## Common Issues

**Issue**: Enemies still die in one hit
- Check: Is `initHealth()` being called in EnemySpawnerSystem?
- Check: Is the collision handler using the new damage logic?

**Issue**: No hit flash visible
- Check: Is `triggerHitFlash()` being called in `takeDamage()`?
- Check: Is `isDead()` returning false for surviving enemies?

**Issue**: Damage multiplier not working
- Check: `Math.floor(projectile.damage)` returns expected value
- Check: PlayerProjectile.damage is set correctly (log in PlayerWeaponsSystem)
