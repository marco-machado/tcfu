import { Scene } from "phaser";
import { GAME_STATE_CONFIG } from "../config/GameConfig";
import { HighScoreManager } from "../utils/HighScoreManager";

export class UIScene extends Scene {
    private scoreText: Phaser.GameObjects.Text;
    private livesText: Phaser.GameObjects.Text;
    private waveText: Phaser.GameObjects.Text;
    private waveAnnouncement: Phaser.GameObjects.Text | null = null;
    private gameOverText: Phaser.GameObjects.Text | null = null;
    private pauseText: Phaser.GameObjects.Text | null = null;
    private restartKey: Phaser.Input.Keyboard.Key | null = null;
    private menuKey: Phaser.Input.Keyboard.Key | null = null;
    private currentScore: number = 0;

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

        this.waveText = this.add.text(this.scale.width / 2, 20, 'Wave 1', {
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0.5, 0);

        gameScene.events.on('wave-started', this.handleWaveStarted, this);
        gameScene.events.on('score-changed', this.updateScore, this);
        gameScene.events.on('lives-changed', this.updateLives, this);
        gameScene.events.on('game-over', this.showGameOver, this);
        gameScene.events.on('game-paused', this.showPaused, this);
        gameScene.events.on('game-resumed', this.hidePaused, this);

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            gameScene.events.off('wave-started', this.handleWaveStarted, this);
            gameScene.events.off('score-changed', this.updateScore, this);
            gameScene.events.off('lives-changed', this.updateLives, this);
            gameScene.events.off('game-over', this.showGameOver, this);
            gameScene.events.off('game-paused', this.showPaused, this);
            gameScene.events.off('game-resumed', this.hidePaused, this);
        });
    }

    private updateScore(data: { score: number }) {
        this.currentScore = data.score;
        this.scoreText.setText(`Score: ${data.score}`);
    }

    private updateLives(data: { lives: number }) {
        this.livesText.setText(`Lives: ${data.lives}`);
    }

    private handleWaveStarted(data: { currentWave: number }) {
        this.waveText.setText(`Wave ${data.currentWave}`);

        if (data.currentWave > 1) {
            this.showWaveAnnouncement(data.currentWave);
        }
    }

    private showWaveAnnouncement(waveNumber: number) {
        if (this.waveAnnouncement) {
            this.waveAnnouncement.destroy();
        }

        this.waveAnnouncement = this.add.text(
            this.scale.width / 2,
            this.scale.height / 2 - 50,
            `WAVE ${waveNumber}`,
            { fontSize: '48px', color: '#ffff00' }
        ).setOrigin(0.5).setAlpha(0);

        this.tweens.add({
            targets: this.waveAnnouncement,
            alpha: { from: 0, to: 1 },
            scale: { from: 0.5, to: 1.2 },
            duration: 300,
            ease: 'Power2',
            yoyo: true,
            hold: 500,
            onComplete: () => {
                this.waveAnnouncement?.destroy();
                this.waveAnnouncement = null;
            }
        });
    }

    private showGameOver() {
        const isNewHighScore = HighScoreManager.update(this.currentScore);
        const highScore = HighScoreManager.get();

        this.gameOverText = this.add.text(
            this.scale.width / 2,
            this.scale.height / 2 - 30,
            'GAME OVER',
            { fontSize: '32px', color: '#ff0000' }
        ).setOrigin(0.5);

        if (isNewHighScore) {
            this.add.text(
                this.scale.width / 2,
                this.scale.height / 2 + 10,
                'NEW HIGH SCORE!',
                { fontSize: '18px', color: '#ffff00' }
            ).setOrigin(0.5);
        }

        this.add.text(
            this.scale.width / 2,
            this.scale.height / 2 + 40,
            `High Score: ${highScore}`,
            { fontSize: '16px', color: '#ffffff' }
        ).setOrigin(0.5);

        this.add.text(
            this.scale.width / 2,
            this.scale.height / 2 + 80,
            'R - Restart   M - Main Menu',
            { fontSize: '14px', color: '#ffffff' }
        ).setOrigin(0.5);

        this.restartKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.R) ?? null;
        this.restartKey?.once('down', this.restartGame, this);

        this.menuKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.M) ?? null;
        this.menuKey?.once('down', this.goToMainMenu, this);
    }

    private restartGame() {
        this.scene.stop('UIScene');
        this.scene.stop('GameScene');
        this.scene.start('GameScene');
    }

    private showPaused() {
        this.pauseText = this.add.text(
            this.scale.width / 2,
            this.scale.height / 2 - 20,
            'PAUSED',
            { fontSize: '32px', color: '#ffffff' }
        ).setOrigin(0.5);

        this.add.text(
            this.scale.width / 2,
            this.scale.height / 2 + 30,
            'P - Resume   M - Main Menu',
            { fontSize: '14px', color: '#ffffff' }
        ).setOrigin(0.5).setName('pauseHint');

        this.menuKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.M) ?? null;
        this.menuKey?.once('down', this.goToMainMenu, this);
    }

    private hidePaused() {
        this.pauseText?.destroy();
        this.pauseText = null;
        this.children.getByName('pauseHint')?.destroy();
        this.menuKey?.off('down', this.goToMainMenu, this);
    }

    private goToMainMenu() {
        this.scene.stop('UIScene');
        this.scene.stop('GameScene');
        this.scene.start('MainMenuScene');
    }
}
