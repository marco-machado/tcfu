export class Enemy extends Phaser.GameObjects.Container {
    constructor(scene: Phaser.Scene) {
        super(scene, 0, -150);

        // Add this container to the scene
        this.scene.add.existing(this);

        // Enable physics on this container
        this.scene.physics.add.existing(this);

        // Setup cleanup on destroy
        this.once(Phaser.GameObjects.Events.DESTROY, () => {
            this.cleanup();
        }, this);
    }

    protected cleanup() {
        // Override in subclasses for specific cleanup
    }
}
