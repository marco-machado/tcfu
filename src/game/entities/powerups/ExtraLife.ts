import { POWERUP_CONFIG } from "../../config/GameConfig"
import { PowerUp, PowerUpCategory, PowerUpType } from "./PowerUp"

export class ExtraLife extends PowerUp {
    readonly type = PowerUpType.EXTRA_LIFE
    readonly category = PowerUpCategory.INSTANT

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, POWERUP_CONFIG.types.extraLife.assetKey)
    }

    onCollect(scene: Phaser.Scene) {
        scene.events.emit('powerup-extra-life')
    }
}
