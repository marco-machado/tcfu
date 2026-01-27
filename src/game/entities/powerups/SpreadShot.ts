import { POWERUP_CONFIG } from "../../config/GameConfig"
import { PowerUp, PowerUpCategory, PowerUpType } from "./PowerUp"

export class SpreadShot extends PowerUp {
    readonly type = PowerUpType.SPREAD_SHOT
    readonly category = PowerUpCategory.PERMANENT

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, POWERUP_CONFIG.types.spreadShot.assetKey)
    }

    onCollect(scene: Phaser.Scene) {
        scene.events.emit('powerup-spread-shot')
    }
}
