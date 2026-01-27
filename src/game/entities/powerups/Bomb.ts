import { POWERUP_CONFIG } from "../../config/GameConfig"
import { PowerUp, PowerUpCategory, PowerUpType } from "./PowerUp"

export class Bomb extends PowerUp {
    readonly type = PowerUpType.BOMB
    readonly category = PowerUpCategory.INSTANT

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, POWERUP_CONFIG.types.bomb.assetKey)
    }

    onCollect(scene: Phaser.Scene) {
        scene.events.emit('powerup-bomb-collected')
    }
}
