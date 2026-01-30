# New Entity Skill

Scaffolds new game entities following the project's Container-based pattern.

## Invocation

User-only: `/new-entity <EntityName>`

Example: `/new-entity PlayerShield`

## Entity Pattern

All entities in this project extend `Phaser.GameObjects.Container` and follow these conventions:

### Required Structure

```typescript
import { YOUR_CONFIG } from "../config/GameConfig"

export class EntityName extends Phaser.GameObjects.Container {
    private sprite1: Phaser.GameObjects.Sprite
    // ... other child sprites

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y)

        // 1. Add container to scene
        this.scene.add.existing(this)

        // 2. Enable physics
        this.scene.physics.add.existing(this)

        // 3. Configure physics body (with type guard)
        if (this.body && this.body instanceof Phaser.Physics.Arcade.Body) {
            this.body.setSize(width, height)
            this.body.setOffset(offsetX, offsetY)
            // Optional: this.body.setCollideWorldBounds(true)
        }

        // 4. Create child sprites at relative positions
        this.sprite1 = this.scene.add.sprite(0, 0, 'asset-key')

        // 5. Add children to container
        this.add([this.sprite1])

        // 6. Setup event listeners
        this.scene.events.on('event-name', this.handleEvent, this)

        // 7. Register cleanup on destroy
        this.once(Phaser.GameObjects.Events.DESTROY, () => {
            this.scene.events.off('event-name', this.handleEvent, this)
            // Clear references
            this.sprite1 = null as any
        }, this)
    }
}
```

### Key Patterns

1. **Physics body type guard**: Always check `this.body instanceof Phaser.Physics.Arcade.Body` before accessing body properties

2. **Child sprites**: Create with `this.scene.add.sprite()` at relative (0, 0) positions, then `this.add([...])` to container

3. **Config constants**: Add entity-specific config to `src/game/config/GameConfig.ts`:
   ```typescript
   export const ENTITY_CONFIG = {
       body: { width: 24, height: 24, offsetX: -12, offsetY: -12 },
       // other entity-specific values
   }
   ```

4. **Cleanup**: Register destroy handler with `this.once(Phaser.GameObjects.Events.DESTROY, ...)` to:
   - Unregister event listeners with `.off()`
   - Stop animations
   - Clear sprite references

5. **Enemy entities**: Extend the base `Enemy` class from `src/game/entities/Enemy.ts` and override `cleanup()` method

6. **Powerup entities**: Extend `PowerUp` base class from `src/game/entities/powerups/PowerUp.ts`

## Reference Files

- Player (complex entity): `src/game/entities/Player.ts`
- Enemy base: `src/game/entities/Enemy.ts`
- Enemy subclass: `src/game/entities/KlaedScout.ts`
- Powerup base: `src/game/entities/powerups/PowerUp.ts`
- Config: `src/game/config/GameConfig.ts`

## After Scaffolding

1. Add config constants to `GameConfig.ts`
2. Import the new entity where needed
3. Add to appropriate physics group in `GameScene.ts`
4. Set up collisions if needed
