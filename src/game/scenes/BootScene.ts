import { Scene } from "phaser";

export class BootScene extends Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        try {
            this.load.setPath('assets');

            this.load.pack('assets', 'data/assets.json');

            this.load.json('animations', 'data/animations.json');
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error(error);
        }
    }

    create() {
        this.#createAnimations();

        this.scene.start('MainMenuScene');
    }

    #createAnimations() {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const data = this.cache.json.get('animations');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data.forEach((animation: any) => {
            const frames = animation.frames
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                ? this.anims.generateFrameNumbers(animation.assetKey, {frames: animation.frames})
                : this.anims.generateFrameNumbers(animation.assetKey);
            this.anims.create({
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                key: animation.key,
                frames,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                frameRate: animation.frameRate,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                repeat: animation.repeat,
            })
        })
    }
}
