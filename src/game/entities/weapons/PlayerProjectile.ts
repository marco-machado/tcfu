export class PlayerProjectile extends Phaser.GameObjects.Sprite {
    constructor(scene: Phaser.Scene, x: number, y: number, group: Phaser.Physics.Arcade.Group) {
        super(scene, x, y, 'klaed-scout-bullet');

        group.add(this, true);

        if (this.body && this.body instanceof Phaser.Physics.Arcade.Body) {
            this.body.setSize(4, 12).setOffset(0, 4);
        }

        this.play('klaed-scout-bullet-flying');
    }

    update() {
        console.log('UPDATE');
    }
}
