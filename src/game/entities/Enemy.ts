import { ENEMY_CONFIG, ENEMY_HEALTH_CONFIG } from '../config/GameConfig'

export class Enemy extends Phaser.GameObjects.Container {
    private health: number
    private maxHealth: number
    private hitFlashTimer: Phaser.Time.TimerEvent | null = null
    private hitFlashTween: Phaser.Tweens.Tween | null = null
    private scaleTween: Phaser.Tweens.Tween | null = null

    constructor(scene: Phaser.Scene, baseHealth: number, waveNumber: number) {
        super(scene, 0, ENEMY_CONFIG.initialY)

        if (!Number.isFinite(baseHealth) || baseHealth <= 0) {
            throw new Error(`Enemy: Invalid baseHealth ${baseHealth}`)
        }
        if (!Number.isInteger(waveNumber) || waveNumber < 1) {
            throw new Error(`Enemy: Invalid waveNumber ${waveNumber}`)
        }

        const healthPerWave = ENEMY_HEALTH_CONFIG.scaling.healthPerWave
        this.maxHealth = baseHealth + (waveNumber - 1) * healthPerWave
        this.health = this.maxHealth

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);

        this.once(Phaser.GameObjects.Events.DESTROY, () => {
            this.cleanup();
        }, this);
    }

    isDead(): boolean {
        return this.health <= 0
    }

    takeDamage(amount: number): void {
        if (!Number.isFinite(amount) || amount < 0) {
            throw new Error(`Enemy.takeDamage: Invalid damage ${amount}`)
        }

        this.health = Math.max(0, this.health - amount)
        if (!this.isDead()) {
            this.triggerHitFlash()
        }
    }

    getHealth(): number {
        return this.health
    }

    getMaxHealth(): number {
        return this.maxHealth
    }

    protected triggerHitFlash(): void {
        if (this.hitFlashTimer) {
            this.hitFlashTimer.remove()
        }
        if (this.hitFlashTween) {
            this.hitFlashTween.destroy()
        }

        const { tintColor, duration, flashAlpha, scaleBounce } = ENEMY_HEALTH_CONFIG.hitFlash

        this.each((child: Phaser.GameObjects.GameObject) => {
            if (child instanceof Phaser.GameObjects.Sprite) {
                child.setTint(tintColor)
            }
        })

        this.hitFlashTween = this.scene.tweens.add({
            targets: this,
            alpha: flashAlpha,
            duration: duration / 2,
            yoyo: true,
            onComplete: () => {
                this.alpha = 1
                this.hitFlashTween = null
            }
        })

        if (scaleBounce > 0) {
            this.scaleTween = this.scene.tweens.add({
                targets: this,
                scale: 1 + scaleBounce,
                duration: duration / 2,
                yoyo: true,
                ease: 'Quad.easeOut'
            })
        }

        this.hitFlashTimer = this.scene.time.delayedCall(duration, () => {
            if (this.active) {
                this.each((child: Phaser.GameObjects.GameObject) => {
                    if (child instanceof Phaser.GameObjects.Sprite) {
                        child.clearTint()
                    }
                })
            }
            this.hitFlashTimer = null
        })
    }

    protected cleanup() {
        if (this.hitFlashTimer) {
            this.hitFlashTimer.remove()
            this.hitFlashTimer = null
        }
        if (this.hitFlashTween) {
            this.hitFlashTween.destroy()
            this.hitFlashTween = null
        }
        if (this.scaleTween) {
            this.scaleTween.destroy()
            this.scaleTween = null
        }
    }
}
