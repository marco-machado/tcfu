import { Scene } from "phaser";
import { GAME_STATE_CONFIG } from "../config/GameConfig";

export class UIScene extends Scene {
    private scoreText: Phaser.GameObjects.Text;
    private livesText: Phaser.GameObjects.Text;
    private gameOverText: Phaser.GameObjects.Text | null = null;

    constructor() {
        super('UIScene');
    }

    create() {
        this.scene.bringToTop();

        const gameScene = this.scene.get('GameScene');

        this.livesText = this.add.text(20, 20, `Lives: ${GAME_STATE_CONFIG.initialLives}`, {
            fontSize: '16px',
            color: '#ffffff'
        });

        this.scoreText = this.add.text(this.scale.width - 20, 20, 'Score: 0', {
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(1, 0);

        gameScene.events.on('score-changed', this.updateScore, this);
        gameScene.events.on('lives-changed', this.updateLives, this);
        gameScene.events.on('game-over', this.showGameOver, this);

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            gameScene.events.off('score-changed', this.updateScore, this);
            gameScene.events.off('lives-changed', this.updateLives, this);
            gameScene.events.off('game-over', this.showGameOver, this);
        });
    }

    private updateScore(data: { score: number }) {
        this.scoreText.setText(`Score: ${data.score}`);
    }

    private updateLives(data: { lives: number }) {
        this.livesText.setText(`Lives: ${data.lives}`);
    }

    private showGameOver() {
        this.gameOverText = this.add.text(
            this.scale.width / 2,
            this.scale.height / 2,
            'GAME OVER',
            { fontSize: '32px', color: '#ff0000' }
        ).setOrigin(0.5);
    }
}
