import { Enemy } from "./Enemy";

export class KlaedScout extends Enemy {
    private ship: Phaser.GameObjects.Sprite;
    private engine: Phaser.GameObjects.Sprite;

    constructor(scene: Phaser.Scene) {
        super(scene);

        // Set physics properties
        if (this.body && this.body instanceof Phaser.Physics.Arcade.Body) {
            this.body.setSize(24, 26);
            this.body.setOffset(-12, -18);
        }

        this.ship = this.scene.add.sprite(0, 0, 'klaed-scout-ship').setFlipY(true);
        this.engine = this.scene.add.sprite(0, 0, 'klaed-scout-engine').setFlipY(true);
        this.engine.play('klaed-scout-engine-powering');

        this.add([this.engine, this.ship]);
    }

    protected cleanup() {
        // Stop any running animations
        if (this.engine && this.engine.anims) {
            this.engine.anims.stop();
        }
        
        // Clear sprite references
        this.ship = null as any;
        this.engine = null as any;
        
        super.cleanup();
    }
}
