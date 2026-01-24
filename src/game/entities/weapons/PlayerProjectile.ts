import { WEAPON_CONFIG } from "../../config/GameConfig";

export class PlayerProjectile extends Phaser.GameObjects.Sprite {
    constructor(scene: Phaser.Scene, x: number, y: number, group: Phaser.Physics.Arcade.Group) {
        super(scene, x, y, 'player-bullet');

        group.add(this, true);

        if (this.body && this.body instanceof Phaser.Physics.Arcade.Body) {
            const body = WEAPON_CONFIG.player.projectileBody;
            this.body.setSize(body.width, body.height).setOffset(body.offsetX, body.offsetY);
        }
    }

    update() {
        console.log('UPDATE');
    }
}
