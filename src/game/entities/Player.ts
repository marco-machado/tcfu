export class Player extends Phaser.GameObjects.Container {
    private ship: Phaser.GameObjects.Sprite;
    private engine: Phaser.GameObjects.Sprite;
    private engineIdle: Phaser.GameObjects.Sprite;

    private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys | undefined;

    constructor(scene: Phaser.Scene) {
        super(scene, scene.scale.width / 2, scene.scale.height - 50);

        // Add this container to the scene
        this.scene.add.existing(this);

        // Enable physics on this container
        this.scene.physics.add.existing(this);

        // Set physics properties
        if (this.body && this.body instanceof Phaser.Physics.Arcade.Body) {
            this.body.setCollideWorldBounds(true);
            this.body.setOffset(-14, -14);
            this.body.setSize(28, 28);
        }

        // Build the ship
        this.ship = this.scene.add.sprite(0, -2, 'player-ship');
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
                this.body.setVelocityX(-200);
            } else if (this.cursorKeys?.right.isDown) {
                this.body.setVelocityX(200);
            } else {
                this.body.setVelocityX(0);
            }

            if (this.cursorKeys?.space.isDown) {
                this.scene.events.emit('player-weapon-fired');
            }
        }
    }
}
