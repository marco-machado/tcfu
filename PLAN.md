# TCFU Development Plan

> Use ✅ for completed tasks, `[ ]` for pending tasks.

## Current State: Early-to-Mid Prototype

### What's Working
- ✅ Player entity with keyboard controls and multi-sprite container
- ✅ KlaedScout enemy type spawning and moving
- ✅ Player weapons system with cooldown-based firing
- ✅ Basic collisions (player-enemy, projectile-enemy)
- ✅ Scrolling background
- ✅ Animated sprites on all entities
- ✅ Three-scene architecture (Boot → Game → UI)
- ✅ Event-driven system communication
- ✅ Scene shutdown/cleanup methods

### Known Issues
- ✅ Debug console.log statements in `PlayerWeaponsSystem.ts` (lines 36, 38, 52)
- ✅ Player projectile uses wrong sprite (`klaed-scout-bullet` instead of player bullet)
- [ ] UIScene is placeholder only (displays "UI Scene" text)
- [ ] Object pooling referenced but not fully implemented

---

## GameScene.ts Improvements Plan

### 1. **Configuration Management**
- ✅ Extract magic numbers into a config object (background scroll speed, spawn positions)
- ✅ Create constants for game dimensions and physics settings

### 2. **Scene Lifecycle Management**
- ✅ Add `shutdown()` method to properly clean up resources
- ✅ Remove event listeners and destroy systems on scene shutdown
- ✅ Clear physics groups properly

### 3. **Game State Management**
- [ ] Add score tracking system
- [ ] Implement player lives/health system
- [ ] Add game over state handling
- [ ] Track wave progression or difficulty scaling

### 4. **Enhanced Collision System**
- [ ] Replace instant destruction with damage system
- [ ] Add visual effects (explosions, screen shake)
- [ ] Implement scoring on enemy destruction
- [ ] Add invulnerability frames for player after hit

### 5. **Type Safety Improvements**
- [ ] Use generics for physics groups: `Phaser.Physics.Arcade.Group<PlayerProjectile>`
- [ ] Add proper typing for collision callbacks
- [ ] Create interfaces for game state

### 6. **Code Organization**
- [ ] Extract collision handlers into separate methods
- [ ] Create a GameConfig interface for settings
- [ ] Separate concerns with dedicated handler methods

### 7. **Visual/Audio Feedback**
- [ ] Add particle effects for explosions
- [ ] Implement screen effects (flash, shake)
- [ ] Add UI feedback for hits and score
- [ ] Add sound effects

### 8. **Event System Enhancement**
- [ ] Emit events for score changes, game over, enemy destroyed
- [ ] Create centralized event constants
- [ ] Better integration with UIScene

### 9. **Performance Optimizations**
- [ ] Object pooling for projectiles and effects
- ✅ Configurable background scroll speed
- [ ] Batch destroy operations

### 10. **Documentation**
- [ ] Add JSDoc comments for all methods
- [ ] Document game systems and their interactions

---

## Future Features

### Content Expansion
- [ ] Additional enemy types with varied behaviors
- [ ] Enemy AI (movement patterns, targeting)
- [ ] Enemy return fire / projectiles
- [ ] Boss encounters
- [ ] Power-ups and collectibles

### Progression
- [ ] Wave system
- [ ] Difficulty scaling
- [ ] High score persistence

### Polish
- [ ] Main menu scene
- [ ] Pause functionality
- [ ] Game over screen with restart
