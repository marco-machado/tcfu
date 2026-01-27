import { ANIMATION_CONFIG, PLAYER_CONFIG, POWERUP_CONFIG } from "../config/GameConfig";

export class Player extends Phaser.GameObjects.Container {
    private ship: Phaser.GameObjects.Sprite;
    private engine: Phaser.GameObjects.Sprite;
    private engineIdle: Phaser.GameObjects.Sprite;
    private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
    private isInvincible: boolean = false;
    private speedBonus: number = 0;

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
        this.scene.events.on('powerup-modifiers-changed', this.handleModifiersChanged, this);

        this.once(Phaser.GameObjects.Events.DESTROY, () => {
            this.scene.events.off(Phaser.Scenes.Events.UPDATE, this.update, this);
            this.scene.events.off('powerup-modifiers-changed', this.handleModifiersChanged, this);
            this.cursorKeys = undefined;
        }, this);
    }

    update() {
        if (this.body && this.body instanceof Phaser.Physics.Arcade.Body) {
            let vx = 0;
            let vy = 0;

            if (this.cursorKeys?.left.isDown) {
                vx = -1;
            } else if (this.cursorKeys?.right.isDown) {
                vx = 1;
            }

            if (this.cursorKeys?.up.isDown) {
                vy = -1;
            } else if (this.cursorKeys?.down.isDown) {
                vy = 1;
            }

            if (vx !== 0 && vy !== 0) {
                const diagonal = Math.SQRT1_2;
                vx *= diagonal;
                vy *= diagonal;
            }

            const currentSpeed = PLAYER_CONFIG.velocity + this.speedBonus;
            this.body.setVelocity(vx * currentSpeed, vy * currentSpeed);

            if (this.cursorKeys?.space.isDown) {
                this.scene.events.emit('player-weapon-fired');
            }
        }
    }

    private handleModifiersChanged(modifiers: { speedBonuses: number }) {
        this.speedBonus = modifiers.speedBonuses * POWERUP_CONFIG.permanent.speedBonus;
    }

    getIsInvincible(): boolean {
        return this.isInvincible;
    }

    triggerInvincibility(duration: number) {
        this.isInvincible = true;

        const { flashAlpha, flashDuration, flashRepeatDivisor } = ANIMATION_CONFIG.playerInvincibility
        this.scene.tweens.add({
            targets: this,
            alpha: flashAlpha,
            duration: flashDuration,
            yoyo: true,
            repeat: Math.floor(duration / flashRepeatDivisor),
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
