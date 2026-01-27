import { POWERUP_CONFIG } from "../../config/GameConfig"

export enum PowerUpType {
    EXTRA_LIFE = 'extraLife',
    FIRE_RATE_UP = 'fireRateUp',
    DAMAGE_UP = 'damageUp',
    SPREAD_SHOT = 'spreadShot',
    SPEED_UP = 'speedUp',
    INVINCIBILITY = 'invincibility',
    SHIELD = 'shield',
    MAGNET = 'magnet',
    SCORE_MULTIPLIER = 'scoreMultiplier',
    BOMB = 'bomb',
}

export enum PowerUpCategory {
    INSTANT = 'instant',
    PERMANENT = 'permanent',
    TIMED = 'timed',
}

export abstract class PowerUp extends Phaser.GameObjects.Container {
    protected sprite: Phaser.GameObjects.Sprite
    abstract readonly type: PowerUpType
    abstract readonly category: PowerUpCategory

    constructor(scene: Phaser.Scene, x: number, y: number, assetKey: string) {
        super(scene, x, y)

        this.scene.add.existing(this)
        this.scene.physics.add.existing(this)

        if (this.body && this.body instanceof Phaser.Physics.Arcade.Body) {
            const { width, height, offsetX, offsetY } = POWERUP_CONFIG.body
            this.body.setSize(width, height)
            this.body.setOffset(offsetX, offsetY)
        }

        this.sprite = this.scene.add.sprite(0, 0, assetKey)
        this.add(this.sprite)

        const animKey = `${assetKey}-idle`
        if (this.scene.anims.exists(animKey)) {
            this.sprite.play(animKey)
        }

        this.once(Phaser.GameObjects.Events.DESTROY, this.cleanup, this)
    }

    abstract onCollect(scene: Phaser.Scene): void

    getDuration(): number | null {
        return null
    }

    protected cleanup() {
        if (this.sprite?.anims) {
            this.sprite.anims.stop()
        }
    }
}
