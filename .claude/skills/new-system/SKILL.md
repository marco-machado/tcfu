# New System Skill

Scaffolds new game systems implementing the ISystem interface.

## Invocation

User-only: `/new-system <SystemName>`

Example: `/new-system CollisionSystem`

## System Pattern

All systems implement `ISystem` from `src/game/systems/ISystem.ts` and follow these conventions:

### Required Structure

```typescript
import { YOUR_CONFIG } from "../config/GameConfig"
import { ISystem } from "./ISystem"

export class SystemNameSystem implements ISystem {
    private scene: Phaser.Scene | null
    private dependency1: Type | null
    // ... other dependencies as null-initialized

    constructor(scene: Phaser.Scene, dependency1: Type) {
        this.scene = scene
        this.dependency1 = dependency1

        this.setupEventListeners()
    }

    private setupEventListeners() {
        if (!this.scene) return

        this.scene.events.on('event-name', this.handleEventName, this)
        this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this)
    }

    private update() {
        if (!this.scene || this.scene.physics.world.isPaused) return
        // Per-frame logic
    }

    private handleEventName(data: EventDataType) {
        if (!this.scene) return
        // Event handling logic
    }

    destroy() {
        if (this.scene) {
            this.scene.events.off('event-name', this.handleEventName, this)
            this.scene.events.off(Phaser.Scenes.Events.UPDATE, this.update, this)
        }

        // Clear collections
        // this.collection.clear()

        // Null all references
        this.dependency1 = null
        this.scene = null
    }
}
```

### Key Patterns

1. **ISystem interface**: Must implement `destroy(): void` method

2. **Null-initialized properties**: All dependencies stored as `Type | null` and initialized to the passed value in constructor

3. **setupEventListeners()**: Separate method for registering all event listeners, called from constructor

4. **Handler naming**: Event handlers named `handle*` (e.g., `handleWaveStarted`, `handleEnemyDestroyed`)

5. **Null guards**: Every method checks `if (!this.scene) return` at the start

6. **Pause awareness**: Update methods check `this.scene.physics.world.isPaused` when appropriate

7. **destroy() cleanup order**:
   - Unregister all listeners with `.off()` and same handler reference
   - Clear any Maps/Sets/Arrays
   - Set all dependencies to `null`
   - Set `this.scene = null` last

## GameScene Integration

Systems are instantiated in `GameScene.create()` and destroyed in `shutdown()`:

```typescript
// In GameScene.ts

// Property declaration
private _mySystem: MySystem | undefined

// In create()
this._mySystem = new MySystem(this, dependency1, dependency2)

// In shutdown()
this._mySystem?.destroy()
this._mySystem = undefined
```

## Reference Files

- ISystem interface: `src/game/systems/ISystem.ts`
- Simple system: `src/game/systems/WaveSystem.ts`
- Complex system: `src/game/systems/PowerUpSystem.ts`
- State system: `src/game/systems/PlayerPowerUpState.ts`
- GameScene integration: `src/game/scenes/GameScene.ts`

## Common Events

| Event | Payload | Purpose |
|-------|---------|---------|
| `score-changed` | `{ score }` | Score updates |
| `enemy-destroyed` | `{ points, x, y }` | Enemy death |
| `player-hit` | - | Player damage |
| `wave-started` | `{ currentWave, scoreInWave, scoreRequired, spawnRate, enemyVelocity }` | New wave |
| `wave-difficulty-changed` | `{ spawnRate, enemyVelocity }` | Difficulty scaling |
| `game-paused` / `game-resumed` | - | Pause state |
| `game-over` | - | End game |

## After Scaffolding

1. Add config constants to `GameConfig.ts` if needed
2. Import and instantiate in `GameScene.create()`
3. Call `destroy()` in `GameScene.shutdown()`
4. Document new events in CLAUDE.md if adding custom events
