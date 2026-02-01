import { ENEMY_HEALTH_CONFIG } from "../config/GameConfig"

export class Enemy extends Phaser.GameObjects.Container {
    protected health: number = 1
    protected maxHealth: number = 1

    constructor(scene: Phaser.Scene) {
        super(scene, 0, -150);

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);

        this.once(Phaser.GameObjects.Events.DESTROY, () => {
            this.cleanup();
        }, this);
    }

    initHealth(baseHealth: number, waveNumber: number): void {
        this.maxHealth = baseHealth + (waveNumber - 1) * ENEMY_HEALTH_CONFIG.scaling.healthPerWave
        this.health = this.maxHealth
    }

    isDead(): boolean {
        return this.health <= 0
    }

    takeDamage(amount: number): void {
        this.health -= amount
        if (!this.isDead()) {
            this.triggerHitFlash()
        }
    }

    protected triggerHitFlash(): void {
        const { tintColor, duration } = ENEMY_HEALTH_CONFIG.hitFlash
        this.each((child: Phaser.GameObjects.GameObject) => {
            if (child instanceof Phaser.GameObjects.Sprite) {
                child.setTint(tintColor)
            }
        })
        this.scene.time.delayedCall(duration, () => {
            if (this.active) {
                this.each((child: Phaser.GameObjects.GameObject) => {
                    if (child instanceof Phaser.GameObjects.Sprite) {
                        child.clearTint()
                    }
                })
            }
        })
    }

    protected cleanup() {
        // Override in subclasses for specific cleanup
    }
}
