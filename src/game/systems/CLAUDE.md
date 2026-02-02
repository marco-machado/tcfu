# Systems

Systems implement `ISystem` interface (requires `destroy()` method).

## System Architecture

- **PlayerWeaponsSystem**: Manages projectile spawning with cooldown, fire rate bonuses, spread shot, damage multiplier
- **EnemyWeaponsSystem**: Individual enemy fire timing, random cooldowns (2-4s), enemies start shooting at Wave 3
- **EnemySpawnerSystem**: Timer-based spawning, wave-scaled rates, formation spawning (1x1, 2x1, 3x1 from Wave 6+)
- **WaveSystem**: Score-based wave progression (base 500, +300/wave), emits difficulty scaling events
- **GameStateSystem**: Manages score with multiplier support, lives (3-9), game over detection
- **PowerUpSystem**: Random spawning (15s interval), enemy death drops (15% chance), magnet attraction, weighted type selection with exclusion for maxed powerups
- **PlayerPowerUpState**: Manages all active powerup effects, timed effect duration with pause support, shield consumption, bomb count

## Event System

Scene-based Phaser events coordinate between systems.

### Core Game Events

| Event | Emitter | Payload | Purpose |
|-------|---------|---------|---------|
| `player-weapon-fired` | Player | - | Trigger projectile spawn |
| `enemy-destroyed` | GameScene | `{ points, x, y }` | Score + wave progress + powerup drop |
| `player-hit` | GameScene | - | Life lost, trigger invincibility |
| `wave-started` | WaveSystem | `{ currentWave, scoreInWave, scoreRequired, spawnRate, enemyVelocity }` | UI update, difficulty scaling |
| `wave-difficulty-changed` | WaveSystem | `{ spawnRate, enemyVelocity }` | Spawner adjustment |
| `game-over` | GameStateSystem | - | End game state |
| `game-paused` / `game-resumed` | GameScene | - | Toggle pause state, pause powerup timers |
| `score-changed` | GameStateSystem | `{ score }` | UI update |
| `lives-changed` | GameStateSystem | `{ lives }` | UI update |

### Powerup Events

| Event | Emitter | Payload |
|-------|---------|---------|
| `powerup-collected` | GameScene | `{ type }` |
| `powerup-modifiers-changed` | PlayerPowerUpState | `{ fireRateBonuses, damageMultiplier, hasSpreadShot, speedBonuses }` |
| `powerup-timed-started` | PlayerPowerUpState | `{ type, duration }` |
| `powerup-timed-ended` | PlayerPowerUpState | `{ type }` |
| `powerup-shield-active` | PlayerPowerUpState | `true/false` |
| `powerup-shield-absorbed` | PlayerPowerUpState | - |
| `powerup-extra-life` | ExtraLife | - |
| `powerup-bomb-collected` | Bomb | - |
| `bombs-changed` | PlayerPowerUpState | `{ bombs }` |

### Bomb Events

| Event | Emitter | Purpose |
|-------|---------|---------|
| `bomb-activated` | GameScene | Player pressed B key |
| `screen-clear-activated` | GameScene | Destroys all enemies and enemy projectiles |

## UI Elements

### HUD (Top Area)
- Wave (top-center): `Wave 1`
- Score (top-right): `Score: 0`

### Stat Bars (Left Side, Vertical Layout)
- Lives: Ship icons (max 5 displayed, then `+N` overflow text)
- Bombs: Orange segmented bar (3 segments max)
- Damage: Red segmented bar (3 segments max)
- Fire Rate: Yellow/orange segmented bar (3 segments max)
- Speed: Cyan segmented bar (3 segments max)

Each stat uses icon + segmented bar, configured in `UI_CONFIG.hud.statBar`

### Timed Effects Display (Bottom)
- Horizontal bar for each active timed effect
- Shows short name (INV, SHLD, MAG, 2X) with animated progress bar
- Color-coded by effect type, repositions dynamically

### Announcements (Center Screen)
- Wave announcements: `WAVE 2` with scale animation
- Powerup collected: `+1 BOMB` (stacked, color-coded)
- Shield absorbed: `SHIELD BLOCKED!` (cyan)

### Game Over Screen
- `GAME OVER` (red), optional `NEW HIGH SCORE!` (yellow)
- High score display, restart/menu instructions

### Pause Screen
- `PAUSED` (white), resume/menu/bomb instructions
- Debug key reference (if debug enabled)
