import { POWERUP_CONFIG } from "../../config/GameConfig"
import { PowerUp, PowerUpCategory, PowerUpType } from "./PowerUp"

export class Magnet extends PowerUp {
    readonly type = PowerUpType.MAGNET
    readonly category = PowerUpCategory.TIMED

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, POWERUP_CONFIG.types.magnet.assetKey)
    }

    onCollect(scene: Phaser.Scene) {
        scene.events.emit('powerup-magnet-start')
    }

    getDuration(): number {
        return POWERUP_CONFIG.durations.magnet
    }
}
