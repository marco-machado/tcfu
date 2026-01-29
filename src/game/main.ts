import { AUTO, Game, Scale, Types } from 'phaser';
import { GAME_CONFIG, PHYSICS_CONFIG } from './config/GameConfig';
import { BootScene } from "./scenes/BootScene";
import { GameScene } from './scenes/GameScene';
import { MainMenuScene } from "./scenes/MainMenuScene";
import { UIScene } from "./scenes/UIScene";

const config: Types.Core.GameConfig = {
    type: AUTO,
    width: GAME_CONFIG.width,
    height: GAME_CONFIG.height,
    parent: 'game-container',
    pixelArt: true,
    roundPixels: true,
    backgroundColor: GAME_CONFIG.backgroundColor,
    input: {
        gamepad: false,
        keyboard: true,
        mouse: true,
        touch: true,
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: PHYSICS_CONFIG.gravity,
            debug: PHYSICS_CONFIG.debug,
        },
    },
    scale: {
        mode: Scale.FIT,
        autoCenter: Scale.CENTER_BOTH,
    },
    scene: [
        BootScene,
        MainMenuScene,
        GameScene,
        UIScene,
    ]
};

const StartGame = (parent: string) => {
    return new Game({...config, parent});
}

export default StartGame;
