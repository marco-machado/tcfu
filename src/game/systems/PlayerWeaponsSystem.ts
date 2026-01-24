import { WEAPON_CONFIG } from '../config/GameConfig';
import { Player } from '../entities/Player';
import { PlayerProjectile } from '../entities/weapons/PlayerProjectile';
import { ISystem } from './ISystem';

export class PlayerWeaponsSystem implements ISystem {
    private scene: Phaser.Scene | null;
    private player: Player | null;
    private projectilesGroup: Phaser.Physics.Arcade.Group | null;
    private lastFireTime = 0;
    private fireCooldown = WEAPON_CONFIG.player.cooldown;

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

        const spawnY = this.player.y + WEAPON_CONFIG.player.spawnOffsetY;
        const projectile = new PlayerProjectile(this.scene, this.player.x, spawnY, this.projectilesGroup!);

        if (projectile.body && projectile.body instanceof Phaser.Physics.Arcade.Body) {
            projectile.body.setVelocityY(WEAPON_CONFIG.player.velocityY);
        }

        this.lastFireTime = currentTime;
    }

    handleWorldStep() {
        if (!this.projectilesGroup) return;
        this.projectilesGroup.getChildren().forEach((projectile: Phaser.GameObjects.GameObject) => {
            if (!projectile.active) {
                return;
            }

            if (projectile instanceof Phaser.GameObjects.Sprite && projectile.y < WEAPON_CONFIG.player.cleanupThresholdY) {
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

