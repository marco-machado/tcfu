import { GAME_CONFIG, TOUCH_CONTROLS_CONFIG } from '../config/GameConfig'
import { Player } from '../entities/Player'
import { InputManager } from '../input/InputManager'
import { ISystem } from './ISystem'

export class TouchControlsSystem implements ISystem {
    private scene: Phaser.Scene | null
    private player: Player | null
    private inputManager: InputManager | null
    private graphics: Phaser.GameObjects.Graphics | null = null
    private container: Phaser.GameObjects.Container | null = null
    private textObjects: Phaser.GameObjects.Text[] = []

    private activePointerId: number = -1
    private touchOffset: { x: number; y: number } | null = null
    private lastTapTime: number = 0

    private pauseZone: Phaser.Geom.Circle
    private leftZone: Phaser.Geom.Circle
    private rightZone: Phaser.Geom.Circle

    private leftPointerId: number = -1
    private rightPointerId: number = -1

    private isPaused: boolean = false

    constructor(scene: Phaser.Scene, player: Player, inputManager: InputManager) {
        this.scene = scene
        this.player = player
        this.inputManager = inputManager

        const { buttons } = TOUCH_CONTROLS_CONFIG

        this.pauseZone = new Phaser.Geom.Circle(
            buttons.pause.x,
            buttons.pause.y,
            buttons.pause.radius
        )

        this.leftZone = new Phaser.Geom.Circle(
            buttons.left.x,
            buttons.left.y,
            buttons.left.radius
        )

        this.rightZone = new Phaser.Geom.Circle(
            buttons.right.x,
            buttons.right.y,
            buttons.right.radius
        )

        this.createVisuals()
        this.setupTouchHandlers()
        this.setupEventListeners()
    }

    private createVisuals() {
        if (!this.scene) return

        this.container = this.scene.add.container(0, 0)
        this.container.setDepth(1000)

        this.graphics = this.scene.add.graphics()
        this.container.add(this.graphics)

        this.drawControls()
    }

    private drawControls() {
        if (!this.graphics || !this.scene) return

        const { buttons } = TOUCH_CONTROLS_CONFIG

        this.graphics.clear()
        this.clearTextObjects()

        this.drawButton(
            buttons.pause.x,
            buttons.pause.y,
            buttons.pause.radius,
            '||'
        )

        this.drawButton(
            buttons.left.x,
            buttons.left.y,
            buttons.left.radius,
            '<'
        )

        this.drawButton(
            buttons.right.x,
            buttons.right.y,
            buttons.right.radius,
            '>'
        )
    }

    private drawButton(x: number, y: number, radius: number, label: string) {
        if (!this.graphics || !this.scene) return

        const { style } = TOUCH_CONTROLS_CONFIG

        this.graphics.fillStyle(style.fillColor, style.fillAlpha)
        this.graphics.fillCircle(x, y, radius)

        this.graphics.lineStyle(style.strokeWidth, style.strokeColor, style.strokeAlpha)
        this.graphics.strokeCircle(x, y, radius)

        const fontSize = radius > 25 ? '14px' : '10px'
        const text = this.scene.add.text(x, y, label, {
            fontSize,
            color: '#ffffff',
            fontStyle: 'bold',
        }).setOrigin(0.5)
        this.textObjects.push(text)
        this.container?.add(text)
    }

    private clearTextObjects() {
        this.textObjects.forEach(text => text.destroy())
        this.textObjects = []
    }

    private setupTouchHandlers() {
        if (!this.scene) return

        this.scene.input.on('pointerdown', this.handlePointerDown, this)
        this.scene.input.on('pointermove', this.handlePointerMove, this)
        this.scene.input.on('pointerup', this.handlePointerUp, this)
        this.scene.input.on('pointerupoutside', this.handlePointerUp, this)
    }

    private setupEventListeners() {
        if (!this.scene) return

        this.scene.events.on('game-paused', this.handleGamePaused, this)
        this.scene.events.on('game-resumed', this.handleGameResumed, this)
    }

    private handleGamePaused() {
        this.isPaused = true
        this.activePointerId = -1
        this.touchOffset = null
        this.leftPointerId = -1
        this.rightPointerId = -1
        this.inputManager?.setTouchState({ left: false, right: false })
    }

    private handleGameResumed() {
        this.isPaused = false
    }

    private handlePointerDown(pointer: Phaser.Input.Pointer) {
        if (this.pauseZone.contains(pointer.x, pointer.y)) {
            this.scene?.events.emit('pause-button-pressed')
            return
        }

        if (this.isPaused) return

        if (this.leftZone.contains(pointer.x, pointer.y)) {
            this.leftPointerId = pointer.id
            this.inputManager?.setTouchState({ left: true })
            this.lastTapTime = 0
            return
        }

        if (this.rightZone.contains(pointer.x, pointer.y)) {
            this.rightPointerId = pointer.id
            this.inputManager?.setTouchState({ right: true })
            this.lastTapTime = 0
            return
        }

        const now = Date.now()
        if (now - this.lastTapTime < TOUCH_CONTROLS_CONFIG.doubleTapThreshold) {
            this.scene?.events.emit('bomb-activated')
            this.lastTapTime = 0
        } else {
            this.lastTapTime = now
        }

        if (this.activePointerId === -1 && this.player) {
            this.activePointerId = pointer.id
            this.touchOffset = {
                x: pointer.x - this.player.x,
                y: pointer.y - this.player.y,
            }
        }
    }

    private handlePointerMove(pointer: Phaser.Input.Pointer) {
        if (this.isPaused) return

        if (this.activePointerId === pointer.id && this.touchOffset && this.player) {
            const { bounds } = TOUCH_CONTROLS_CONFIG
            const minX = bounds.paddingX
            const maxX = GAME_CONFIG.width - bounds.paddingX
            const minY = bounds.minY
            const maxY = GAME_CONFIG.height - bounds.maxYOffset

            const newX = Phaser.Math.Clamp(pointer.x - this.touchOffset.x, minX, maxX)
            const newY = Phaser.Math.Clamp(pointer.y - this.touchOffset.y, minY, maxY)
            this.player.setPosition(newX, newY)
        }
    }

    private handlePointerUp(pointer: Phaser.Input.Pointer) {
        if (pointer.id === this.leftPointerId) {
            this.leftPointerId = -1
            this.inputManager?.setTouchState({ left: false })
        }

        if (pointer.id === this.rightPointerId) {
            this.rightPointerId = -1
            this.inputManager?.setTouchState({ right: false })
        }

        if (pointer.id === this.activePointerId) {
            this.activePointerId = -1
            this.touchOffset = null
        }
    }

    destroy() {
        if (this.scene) {
            this.scene.input.off('pointerdown', this.handlePointerDown, this)
            this.scene.input.off('pointermove', this.handlePointerMove, this)
            this.scene.input.off('pointerup', this.handlePointerUp, this)
            this.scene.input.off('pointerupoutside', this.handlePointerUp, this)
            this.scene.events.off('game-paused', this.handleGamePaused, this)
            this.scene.events.off('game-resumed', this.handleGameResumed, this)
        }

        this.clearTextObjects()
        this.container?.destroy()
        this.container = null
        this.graphics = null
        this.player = null
        this.inputManager = null
        this.scene = null
    }
}
