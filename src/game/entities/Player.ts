import { PLAYER_CONFIG } from "../config/GameConfig";

export class Player extends Phaser.GameObjects.Container {
    private ship: Phaser.GameObjects.Sprite;
    private engine: Phaser.GameObjects.Sprite;
    private engineIdle: Phaser.GameObjects.Sprite;
    private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
    private isInvincible: boolean = false;

    constructor(scene: Phaser.Scene) {
        super(scene, scene.scale.width / 2, scene.scale.height - PLAYER_CONFIG.spawnOffsetFromBottom);

        // Add this container to the scene
        this.scene.add.existing(this);

        // Enable physics on this container
        this.scene.physics.add.existing(this);

        if (this.body && this.body instanceof Phaser.Physics.Arcade.Body) {
            this.body.setCollideWorldBounds(true);
            this.body.setOffset(PLAYER_CONFIG.body.offsetX, PLAYER_CONFIG.body.offsetY);
            this.body.setSize(PLAYER_CONFIG.body.width, PLAYER_CONFIG.body.height);
        }

        this.ship = this.scene.add.sprite(0, PLAYER_CONFIG.shipSpriteOffsetY, 'player-ship');
        this.engine = this.scene.add.sprite(0, 0, 'player-base-engine');
        this.engineIdle = this.scene.add.sprite(0, 0, 'player-base-engine-effects');
        this.engineIdle.play('player-base-engine-idle')

        this.add([this.engineIdle, this.engine, this.ship]);

        // Keyboard input
        this.cursorKeys = this.scene.input.keyboard?.createCursorKeys();

        // Setup events
        this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);

        this.once(Phaser.GameObjects.Events.DESTROY, () => {
            this.scene.events.off(Phaser.Scenes.Events.UPDATE, this.update, this);
            this.cursorKeys = undefined;
        }, this);
    }

    update() {
        if (this.body && this.body instanceof Phaser.Physics.Arcade.Body) {
            if (this.cursorKeys?.left.isDown) {
                this.body.setVelocityX(-PLAYER_CONFIG.velocity);
            } else if (this.cursorKeys?.right.isDown) {
                this.body.setVelocityX(PLAYER_CONFIG.velocity);
            } else {
                this.body.setVelocityX(0);
            }

            if (this.cursorKeys?.space.isDown) {
                this.scene.events.emit('player-weapon-fired');
            }
        }
    }

    getIsInvincible(): boolean {
        return this.isInvincible;
    }

    triggerInvincibility(duration: number) {
        this.isInvincible = true;

        this.scene.tweens.add({
            targets: this,
            alpha: 0.3,
            duration: 100,
            yoyo: true,
            repeat: Math.floor(duration / 200),
            onComplete: () => {
                this.isInvincible = false;
                this.alpha = 1;
            }
        });
    }

    stopAnimations() {
        this.engineIdle.anims.stop();
        this.scene.tweens.killTweensOf(this);
        this.alpha = 1;
    }

    disableInput() {
        this.scene.events.off(Phaser.Scenes.Events.UPDATE, this.update, this);
        this.cursorKeys = undefined;
    }
}
