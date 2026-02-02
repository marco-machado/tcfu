import { WEAPON_CONFIG } from "../../config/GameConfig"

export class PlayerProjectile extends Phaser.GameObjects.Sprite {
    readonly damage: number

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        group: Phaser.Physics.Arcade.Group,
        damageMultiplier: number = 1
    ) {
        super(scene, x, y, 'player-bullet')
        this.damage = Math.ceil(WEAPON_CONFIG.player.baseDamage * damageMultiplier)

        group.add(this, true)

        if (this.body && this.body instanceof Phaser.Physics.Arcade.Body) {
            const body = WEAPON_CONFIG.player.projectileBody
            this.body.setSize(body.width, body.height).setOffset(body.offsetX, body.offsetY)
        }
    }
}
