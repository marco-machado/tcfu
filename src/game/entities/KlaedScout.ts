import { ENEMY_CONFIG, ENEMY_HEALTH_CONFIG } from "../config/GameConfig";
import { Enemy } from "./Enemy";

export class KlaedScout extends Enemy {
    static readonly BASE_HEALTH = ENEMY_HEALTH_CONFIG.klaedScout.baseHealth

    private ship: Phaser.GameObjects.Sprite;
    private engine: Phaser.GameObjects.Sprite;

    constructor(scene: Phaser.Scene, waveNumber: number) {
        super(scene, KlaedScout.BASE_HEALTH, waveNumber);

        if (this.body && this.body instanceof Phaser.Physics.Arcade.Body) {
            this.body.setSize(ENEMY_CONFIG.klaedScout.body.width, ENEMY_CONFIG.klaedScout.body.height);
            this.body.setOffset(ENEMY_CONFIG.klaedScout.body.offsetX, ENEMY_CONFIG.klaedScout.body.offsetY);
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
