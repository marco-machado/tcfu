import { POWERUP_CONFIG } from "../../config/GameConfig"
import { PowerUp, PowerUpCategory, PowerUpType } from "./PowerUp"

export class FireRateUp extends PowerUp {
    readonly type = PowerUpType.FIRE_RATE_UP
    readonly category = PowerUpCategory.PERMANENT

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, POWERUP_CONFIG.types.fireRateUp.assetKey)
    }

    onCollect(scene: Phaser.Scene) {
        scene.events.emit('powerup-fire-rate-up')
    }
}
