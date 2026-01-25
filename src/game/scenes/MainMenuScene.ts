import { Scene } from "phaser"
import { BACKGROUND_CONFIG } from "../config/GameConfig"

export class MainMenuScene extends Scene {
    private background: Phaser.GameObjects.TileSprite

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

        this.add.text(
            this.scale.width / 2,
            this.scale.height / 3,
            'THEY CAME\nFROM URANUS',
            { fontSize: '32px', color: '#ffffff', align: 'center' }
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
