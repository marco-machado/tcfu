import { Scene } from "phaser"
import { BACKGROUND_CONFIG } from "../config/GameConfig"
import { HighScoreManager } from "../utils/HighScoreManager"

export class MainMenuScene extends Scene {
    private background: Phaser.GameObjects.TileSprite
    private highScoreText: Phaser.GameObjects.Text

    constructor() {
        super('MainMenuScene')
    }

    create() {
        this.background = this.add.tileSprite(
            this.scale.width / 2,
            this.scale.height / 2,
            this.scale.width,
            this.scale.height,
            'background'
        )

        this.add.image(
            this.scale.width / 2,
            this.scale.height / 3,
            'title-logo'
        ).setOrigin(0.5)

        this.highScoreText = this.add.text(
            this.scale.width / 2,
            this.scale.height / 2,
            `High Score: ${HighScoreManager.get()}`,
            { fontSize: '16px', color: '#ffff00' }
        ).setOrigin(0.5)

        const startButton = this.add.text(
            this.scale.width / 2,
            this.scale.height / 2 + 50,
            'START',
            { fontSize: '24px', color: '#ffffff', backgroundColor: '#333333', padding: { x: 20, y: 10 } }
        ).setOrigin(0.5).setInteractive({ useHandCursor: true })

        startButton.on('pointerover', () => {
            startButton.setStyle({ backgroundColor: '#555555' })
        })

        startButton.on('pointerout', () => {
            startButton.setStyle({ backgroundColor: '#333333' })
        })

        startButton.on('pointerdown', () => {
            this.scene.start('GameScene')
        })

        const clearButton = this.add.text(
            this.scale.width / 2,
            this.scale.height / 2 + 100,
            'CLEAR DATA',
            { fontSize: '14px', color: '#ff6666', backgroundColor: '#333333', padding: { x: 10, y: 5 } }
        ).setOrigin(0.5).setInteractive({ useHandCursor: true })

        clearButton.on('pointerover', () => {
            clearButton.setStyle({ backgroundColor: '#555555' })
        })

        clearButton.on('pointerout', () => {
            clearButton.setStyle({ backgroundColor: '#333333' })
        })

        clearButton.on('pointerdown', () => {
            HighScoreManager.clear()
            this.highScoreText.setText('High Score: 0')
        })

        const spaceKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
        spaceKey?.once('down', () => {
            this.scene.start('GameScene')
        })

        this.add.text(
            this.scale.width / 2,
            this.scale.height - 50,
            'Press SPACE or click START',
            { fontSize: '12px', color: '#888888' }
        ).setOrigin(0.5)
    }

    update() {
        this.background.tilePositionY -= BACKGROUND_CONFIG.scrollSpeed
    }
}
