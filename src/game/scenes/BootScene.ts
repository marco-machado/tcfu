import { Scene } from "phaser";

export class Boot extends Scene {
    constructor() {
        super('Boot');
    }

    preload() {
        try {
            this.load.setPath('assets');

            this.load.image('background', 'deep_space.jpg');
            this.load.image('logo', 'logo.png');
        } catch (error) {
            console.error(error);
        }
    }

    create() {
    }
}
