# Entities

## Player
- **Location**: `Player.ts`
- Container-based (ship + engine sprites), keyboard controls (arrows + space)
- Features: invincibility mechanic with flash animation, speed bonus from powerups, diagonal movement support

## Enemies
- **Base Class**: `Enemy.ts` - Container with health system
- **KlaedScout**: `KlaedScout.ts` - animated ship + engine, Y-flipped for top-down

### Health System
- Wave-scaled health: `baseHealth + (waveNumber - 1) * healthPerWave`
- KlaedScout base health: 2, scaling: +1 per wave
- Methods: `takeDamage(amount)`, `isDead()`, `getHealth()`, `getMaxHealth()`
- Hit flash visual feedback: red tint (0xff4444), alpha pulse, scale bounce
- Configuration in `ENEMY_HEALTH_CONFIG` (GameConfig.ts)

## Projectiles
- **PlayerProjectile** (`weapons/PlayerProjectile.ts`): Carries damage multiplier, velocity -400 (upward)
- **EnemyProjectile** (`weapons/EnemyProjectile.ts`): Animated, velocity 210 (downward), auto-cleanup

## PowerUps (10 Types)

Base class: `powerups/PowerUp.ts` - Three categories: `INSTANT`, `PERMANENT`, `TIMED`

### Permanent (Stackable)

| Type | Effect | Max Stacks |
|------|--------|------------|
| FireRateUp | Reduces cooldown 200ms/stack | 3 (min 200ms) |
| DamageUp | 1.5x damage multiplier/stack | 3 |
| SpreadShot | 3-angle spread pattern (-8, 0, +8 degrees) | 1 |
| SpeedUp | Adds movement speed bonus | 3 |

### Instant

| Type | Effect |
|------|--------|
| ExtraLife | +1 life (max 9) |
| Bomb | +1 bomb (max 3, starts with 1) |

### Timed (pausable)

| Type | Duration | Effect |
|------|----------|--------|
| Invincibility | 5s | Damage immunity |
| Shield | 10s | Absorbs one hit |
| Magnet | 15s | Attracts powerups (120px radius) |
| ScoreMultiplier | 15s | 2x score |
