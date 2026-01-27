import { POWERUP_CONFIG } from "../../config/GameConfig"
import { PowerUp, PowerUpCategory, PowerUpType } from "./PowerUp"

export class ScoreMultiplier extends PowerUp {
    readonly type = PowerUpType.SCORE_MULTIPLIER
    readonly category = PowerUpCategory.TIMED

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, POWERUP_CONFIG.types.scoreMultiplier.assetKey)
    }

    onCollect(scene: Phaser.Scene) {
        scene.events.emit('powerup-score-multiplier-start')
    }

    getDuration(): number {
        return POWERUP_CONFIG.durations.scoreMultiplier
    }
}
