import { POWERUP_CONFIG } from "../../config/GameConfig"
import { PowerUp, PowerUpCategory, PowerUpType } from "./PowerUp"

export class DamageUp extends PowerUp {
    readonly type = PowerUpType.DAMAGE_UP
    readonly category = PowerUpCategory.PERMANENT

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, POWERUP_CONFIG.types.damageUp.assetKey)
    }

    onCollect(scene: Phaser.Scene) {
        scene.events.emit('powerup-damage-up')
    }
}
