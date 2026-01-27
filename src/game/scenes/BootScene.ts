import { Scene } from "phaser"
import { GAME_CONFIG } from "../config/GameConfig"

export class BootScene extends Scene {
    private background?: Phaser.GameObjects.TileSprite
    private loadingBar?: Phaser.GameObjects.Graphics

    constructor() {
        super('BootScene')
    }

    preload() {
        this.load.image('background', 'assets/images/deep_space.jpg')

        this.load.once('filecomplete-image-background', () => {
            this.#showBackground()
            this.#createLoadingBar()
        })

        this.load.on('progress', (value: number) => {
            this.#updateLoadingBar(value)
        })

        try {
            this.load.setPath('assets')
            this.load.pack('assets', 'data/assets.json')
            this.load.json('animations', 'data/animations.json')
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error(error)
        }
    }

    create() {
        this.#createAnimations()
        this.scene.start('MainMenuScene')
    }

    #showBackground() {
        this.background = this.add.tileSprite(
            0,
            0,
            GAME_CONFIG.width,
            GAME_CONFIG.height,
            'background'
        )
        this.background.setOrigin(0, 0)
    }

    #createLoadingBar() {
        const barWidth = 200
        const barHeight = 10
        const x = (GAME_CONFIG.width - barWidth) / 2
        const y = GAME_CONFIG.height - 60

        this.loadingBar = this.add.graphics()
        this.loadingBar.fillStyle(0x333333, 1)
        this.loadingBar.fillRect(x, y, barWidth, barHeight)
    }

    #updateLoadingBar(progress: number) {
        if (!this.loadingBar) return

        const barWidth = 200
        const barHeight = 10
        const x = (GAME_CONFIG.width - barWidth) / 2
        const y = GAME_CONFIG.height - 60

        this.loadingBar.clear()
        this.loadingBar.fillStyle(0x333333, 1)
        this.loadingBar.fillRect(x, y, barWidth, barHeight)
        this.loadingBar.fillStyle(0xffffff, 1)
        this.loadingBar.fillRect(x, y, barWidth * progress, barHeight)
    }

    #createAnimations() {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const data = this.cache.json.get('animations')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data.forEach((animation: any) => {
            const frames = animation.frames
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                ? this.anims.generateFrameNumbers(animation.assetKey, {frames: animation.frames})
                : this.anims.generateFrameNumbers(animation.assetKey)
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
