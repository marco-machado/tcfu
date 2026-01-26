import { WEAPON_CONFIG } from "../../config/GameConfig"

export class EnemyProjectile extends Phaser.GameObjects.Sprite {
    constructor(scene: Phaser.Scene, x: number, y: number, group: Phaser.Physics.Arcade.Group) {
        super(scene, x, y, 'klaed-scout-bullet')

        group.add(this, true)

        this.play('klaed-scout-bullet-flying')

        if (this.body && this.body instanceof Phaser.Physics.Arcade.Body) {
            const body = WEAPON_CONFIG.enemy.projectileBody
            this.body.setSize(body.width, body.height).setOffset(body.offsetX, body.offsetY)
        }
    }
}
