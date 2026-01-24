import { Player } from '../entities/Player';
import { PlayerProjectile } from '../entities/weapons/PlayerProjectile';
import { ISystem } from './ISystem';

export class PlayerWeaponsSystem implements ISystem {
    private scene: Phaser.Scene | null;
    private player: Player | null;
    private projectilesGroup: Phaser.Physics.Arcade.Group | null;
    private lastFireTime = 0;
    private fireCooldown = 800;

    constructor(scene: Phaser.Scene, player: Player, projectilesGroup: Phaser.Physics.Arcade.Group) {
        this.scene = scene;
        this.player = player;
        this.projectilesGroup = projectilesGroup;

        this.scene.events.on('player-weapon-fired', this.handleWeaponFired, this);
        this.scene.physics.world.on(Phaser.Physics.Arcade.Events.WORLD_STEP, this.handleWorldStep, this);
    }


    handleWeaponFired() {
        if (!this.scene) return;
        const currentTime = this.scene.time.now;

        // Check if cooldown has elapsed
        if (currentTime - this.lastFireTime < this.fireCooldown) {
            return; // Still in cooldown, don't fire
        }

        if (!this.player || !this.projectilesGroup) {
            return; // Can't fire without player or projectiles group
        }

        const bullet = this.projectilesGroup.getFirstDead(false, this.player.x, this.player.y - 20);
        console.log('HAS BULLET: ', bullet);

        console.log('COUNT', this.projectilesGroup.children);

        // Create a new PlayerProjectile at the player's position
        const projectile = new PlayerProjectile(this.scene, this.player.x, this.player.y - 20, this.projectilesGroup!);

        // Set upward velocity
        if (projectile.body && projectile.body instanceof Phaser.Physics.Arcade.Body) {
            projectile.body.setVelocityY(-400); // Move upward at 400 pixels/second
        }

        // Update the last fire time
        this.lastFireTime = currentTime;

        // eslint-disable-next-line no-console
        console.log('WEAPON FIRED');
    }

    handleWorldStep() {
        if (!this.projectilesGroup) return;
        this.projectilesGroup.getChildren().forEach((projectile: Phaser.GameObjects.GameObject) => {
            if (!projectile.active) {
                return;
            }

            if (projectile instanceof Phaser.GameObjects.Sprite && projectile.y < 100) {
                projectile.setActive(false).setVisible(false);
            }
        })
    }

    destroy() {
        // Remove event listeners
        if (this.scene) {
            this.scene.events.off('player-weapon-fired', this.handleWeaponFired, this);
            this.scene.physics.world.off(Phaser.Physics.Arcade.Events.WORLD_STEP, this.handleWorldStep, this);
        }
        
        // Clear references
        this.projectilesGroup = null;
        this.player = null;
        this.scene = null;
    }
}

