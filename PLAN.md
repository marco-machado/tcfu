# TCFU Development Plan

> Use checkmark for completed tasks, `[ ]` for pending tasks.

## Current State: Feature Complete Prototype

### What's Working
- Player entity with keyboard controls and multi-sprite container
- KlaedScout enemy type spawning and moving
- Player weapons system with cooldown-based firing
- Enemy weapons system (enemies fire starting Wave 3)
- Basic collisions (player-enemy, projectile-enemy, enemy-projectile-player)
- Scrolling background with wave-based speed scaling
- Animated sprites on all entities
- Four-scene architecture (Boot -> MainMenu -> Game + UI)
- Event-driven system communication
- Scene shutdown/cleanup methods
- Loading screen with background and progress bar
- Complete powerup system (10 types: permanent, instant, timed)
- Bomb system with screen clear functionality
- Powerup UI indicators and timed effect progress bars
- Pause system with powerup timer preservation
- Score-based wave progression
- High score persistence

### Known Issues
- [ ] Object pooling referenced but not fully implemented

---

## GameScene.ts Improvements Plan

### 1. **Configuration Management**
- [x] Extract magic numbers into a config object (background scroll speed, spawn positions)
- [x] Create constants for game dimensions and physics settings

### 2. **Scene Lifecycle Management**
- [x] Add `shutdown()` method to properly clean up resources
- [x] Remove event listeners and destroy systems on scene shutdown
- [x] Clear physics groups properly

### 3. **Game State Management**
- [x] Add score tracking system
- [x] Implement player lives/health system
- [x] Add game over state handling
- [x] Track wave progression (score-based thresholds, multipliers affect progression speed)

### 4. **Enhanced Collision System**
- [ ] Replace instant destruction with damage system
- [ ] Add visual effects (explosions, screen shake)
- [x] Implement scoring on enemy destruction
- [x] Add invulnerability frames for player after hit

### 5. **Code Organization**
- [ ] Extract collision handlers into separate methods
- [ ] Create a GameConfig interface for settings
- [ ] Separate concerns with dedicated handler methods

### 6. **Visual/Audio Feedback**
- [ ] Add particle effects for explosions
- [ ] Implement screen effects (flash, shake)
- [x] Add UI feedback for hits and score
- [x] Add powerup collection announcements
- [x] Add shield absorption feedback
- [ ] Add sound effects

### 7. **Event System Enhancement**
- [x] Emit events for score changes, game over, enemy destroyed
- [ ] Create centralized event constants
- [x] Better integration with UIScene
- [x] Powerup events (collected, timed start/end, modifiers changed)
- [x] Bomb events (activated, screen clear)

### 8. **Performance Optimizations**
- [ ] Object pooling for projectiles and effects
- [x] Configurable background scroll speed
- [ ] Batch destroy operations

### 9. **Documentation**
- [x] Document game systems and their interactions

---

## Future Features

### Content Expansion
- [ ] Additional enemy types with varied behaviors
- [ ] Enemy AI (movement patterns, targeting)
- [x] Enemy return fire / projectiles
- [ ] Boss encounters

### Progression
- [x] Wave system (score-based progression)
- [x] Difficulty scaling (spawn rate/enemy velocity per wave)
- [x] High score persistence (via HighScoreManager)
- [x] Formation spawning (1x1, 2x1, 3x1 from Wave 6+)

### Polish
- [x] Main menu scene
- [x] Pause functionality
- [x] Game over screen with restart
- [x] Loading screen with progress bar
- [ ] Sound effects and music

### Powerup System (COMPLETE)
- [x] PowerUp base class with categories (INSTANT, PERMANENT, TIMED)
- [x] PowerUpSystem for spawning (random interval + enemy drops)
- [x] PlayerPowerUpState for tracking active effects
- [x] Permanent powerups: FireRateUp, DamageUp, SpreadShot, SpeedUp
- [x] Instant powerups: ExtraLife, Bomb
- [x] Timed powerups: Invincibility, Shield, Magnet, ScoreMultiplier
- [x] Bomb activation (B key) with screen clear
- [x] Magnet attraction mechanics
- [x] Shield hit absorption
- [x] UI indicators for permanent powerup stacks
- [x] Timed effect progress bars
- [x] Powerup timers pause when game paused
- [x] Weighted spawn selection with maxed powerup exclusion
