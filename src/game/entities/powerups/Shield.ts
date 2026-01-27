import { POWERUP_CONFIG } from "../../config/GameConfig"
import { PowerUp, PowerUpCategory, PowerUpType } from "./PowerUp"

export class Shield extends PowerUp {
    readonly type = PowerUpType.SHIELD
    readonly category = PowerUpCategory.TIMED

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, POWERUP_CONFIG.types.shield.assetKey)
    }

    onCollect(scene: Phaser.Scene) {
        scene.events.emit('powerup-shield-start')
    }

    getDuration(): number {
        return POWERUP_CONFIG.durations.shield
    }
}
