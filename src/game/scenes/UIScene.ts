import { Scene } from "phaser";

export class UIScene extends Scene {
    constructor() {
        super('UIScene');
    }

    create() {
        this.scene.bringToTop();

        this.add.text(20, 20, 'UI Scene');
    }
}
