import { POWERUP_CONFIG } from "../../config/GameConfig"
import { PowerUp, PowerUpCategory, PowerUpType } from "./PowerUp"

export class SpeedUp extends PowerUp {
    readonly type = PowerUpType.SPEED_UP
    readonly category = PowerUpCategory.PERMANENT

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, POWERUP_CONFIG.types.speedUp.assetKey)
    }

    onCollect(scene: Phaser.Scene) {
        scene.events.emit('powerup-speed-up')
    }
}
