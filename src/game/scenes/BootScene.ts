import { Scene } from "phaser"
import { BOOT_CONFIG, GAME_CONFIG } from "../config/GameConfig"

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
        const { width, height, offsetFromBottom, backgroundColor } = BOOT_CONFIG.loadingBar
        const x = (GAME_CONFIG.width - width) / 2
        const y = GAME_CONFIG.height - offsetFromBottom

        this.loadingBar = this.add.graphics()
        this.loadingBar.fillStyle(backgroundColor, 1)
        this.loadingBar.fillRect(x, y, width, height)
    }

    #updateLoadingBar(progress: number) {
        if (!this.loadingBar) return

        const { width, height, offsetFromBottom, backgroundColor, fillColor } = BOOT_CONFIG.loadingBar
        const x = (GAME_CONFIG.width - width) / 2
        const y = GAME_CONFIG.height - offsetFromBottom

        this.loadingBar.clear()
        this.loadingBar.fillStyle(backgroundColor, 1)
        this.loadingBar.fillRect(x, y, width, height)
        this.loadingBar.fillStyle(fillColor, 1)
        this.loadingBar.fillRect(x, y, width * progress, height)
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
