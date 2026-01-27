import { POWERUP_CONFIG } from "../../config/GameConfig"
import { PowerUp, PowerUpCategory, PowerUpType } from "./PowerUp"

export class Invincibility extends PowerUp {
    readonly type = PowerUpType.INVINCIBILITY
    readonly category = PowerUpCategory.TIMED

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, POWERUP_CONFIG.types.invincibility.assetKey)
    }

    onCollect(scene: Phaser.Scene) {
        scene.events.emit('powerup-invincibility-start')
    }

    getDuration(): number {
        return POWERUP_CONFIG.durations.invincibility
    }
}
