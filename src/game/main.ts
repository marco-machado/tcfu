import { AUTO, Game, Scale, Types } from 'phaser';
import { BootScene } from "./scenes/BootScene";
import { GameScene } from './scenes/GameScene';
import { UIScene } from "./scenes/UIScene";

// Find out more information about the GameScene Config at:
// https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config: Types.Core.GameConfig = {
    type: AUTO,
    width: 360,
    height: 640,
    parent: 'game-container',
    pixelArt: true,
    roundPixels: true,
    backgroundColor: '#028af8',
    input: {
        gamepad: false,
        keyboard: true,
        mouse: false,
        touch: false,
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {x: 0, y: 0},
            debug: true,
        },
    },
    scale: {
        mode: Scale.FIT,
        autoCenter: Scale.CENTER_BOTH,
    },
    scene: [
        BootScene,
        GameScene,
        UIScene,
    ]
};

const StartGame = (parent: string) => {
    return new Game({...config, parent});
}

export default StartGame;
