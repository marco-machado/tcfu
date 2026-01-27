import { GAME_CONFIG, TOUCH_CONTROLS_CONFIG } from '../config/GameConfig'
import { InputManager } from '../input/InputManager'
import { ISystem } from './ISystem'

interface TouchPoint {
    id: number
    startX: number
    startY: number
    currentX: number
    currentY: number
}

export class TouchControlsSystem implements ISystem {
    private scene: Phaser.Scene | null
    private inputManager: InputManager | null
    private graphics: Phaser.GameObjects.Graphics | null = null
    private container: Phaser.GameObjects.Container | null = null
    private textObjects: Phaser.GameObjects.Text[] = []

    private movementTouch: TouchPoint | null = null
    private fireButtonPressed: boolean = false
    private firePointerId: number = -1
    private bombButtonPressed: boolean = false
    private bombButtonTimeout: ReturnType<typeof setTimeout> | null = null

    private fireZone: Phaser.Geom.Circle
    private bombZone: Phaser.Geom.Circle
    private pauseZone: Phaser.Geom.Circle
    private movementZoneWidth: number

    private isPaused: boolean = false

    constructor(scene: Phaser.Scene, inputManager: InputManager) {
        this.scene = scene
        this.inputManager = inputManager

        const { buttons } = TOUCH_CONTROLS_CONFIG

        this.fireZone = new Phaser.Geom.Circle(
            buttons.fire.x,
            buttons.fire.y,
            buttons.fire.radius
        )
        this.bombZone = new Phaser.Geom.Circle(
            buttons.bomb.x,
            buttons.bomb.y,
            buttons.bomb.radius
        )
        this.pauseZone = new Phaser.Geom.Circle(
            buttons.pause.x,
            buttons.pause.y,
            buttons.pause.radius
        )
        this.movementZoneWidth = GAME_CONFIG.width * TOUCH_CONTROLS_CONFIG.movementZone.xEnd

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
            buttons.fire.x,
            buttons.fire.y,
            buttons.fire.radius,
            'FIRE',
            this.fireButtonPressed
        )

        this.drawButton(
            buttons.bomb.x,
            buttons.bomb.y,
            buttons.bomb.radius,
            'B',
            this.bombButtonPressed
        )

        this.drawButton(
            buttons.pause.x,
            buttons.pause.y,
            buttons.pause.radius,
            '||',
            false
        )

        if (this.movementTouch) {
            this.drawTouchIndicator()
        }
    }

    private drawButton(x: number, y: number, radius: number, label: string, active: boolean) {
        if (!this.graphics || !this.scene) return

        const { style } = TOUCH_CONTROLS_CONFIG

        const fillColor = active ? style.activeColor : style.fillColor
        const fillAlpha = active ? style.activeAlpha : style.fillAlpha
        this.graphics.fillStyle(fillColor, fillAlpha)
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

    private drawTouchIndicator() {
        if (!this.graphics || !this.movementTouch) return

        const { touchIndicator } = TOUCH_CONTROLS_CONFIG.style

        this.graphics.lineStyle(2, touchIndicator.color, touchIndicator.alpha)
        this.graphics.strokeCircle(
            this.movementTouch.startX,
            this.movementTouch.startY,
            touchIndicator.outerRadius
        )

        this.graphics.fillStyle(touchIndicator.color, touchIndicator.alpha)
        this.graphics.fillCircle(
            this.movementTouch.currentX,
            this.movementTouch.currentY,
            touchIndicator.innerRadius
        )
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

        if (this.fireZone.contains(pointer.x, pointer.y)) {
            this.fireButtonPressed = true
            this.firePointerId = pointer.id
            this.inputManager?.setTouchState({ space: true })
            this.redraw()
            return
        }

        if (this.bombZone.contains(pointer.x, pointer.y)) {
            this.bombButtonPressed = true
            this.scene?.events.emit('bomb-activated')
            this.redraw()
            if (this.bombButtonTimeout) {
                clearTimeout(this.bombButtonTimeout)
            }
            this.bombButtonTimeout = setTimeout(() => {
                this.bombButtonPressed = false
                this.bombButtonTimeout = null
                this.redraw()
            }, 100)
            return
        }

        if (pointer.x < this.movementZoneWidth && !this.movementTouch) {
            this.movementTouch = {
                id: pointer.id,
                startX: pointer.x,
                startY: pointer.y,
                currentX: pointer.x,
                currentY: pointer.y,
            }
            this.redraw()
        }
    }

    private handlePointerMove(pointer: Phaser.Input.Pointer) {
        if (this.isPaused) return

        if (this.movementTouch && pointer.id === this.movementTouch.id) {
            this.movementTouch.currentX = pointer.x
            this.movementTouch.currentY = pointer.y
            this.updateMovementState()
            this.redraw()
        }
    }

    private handlePointerUp(pointer: Phaser.Input.Pointer) {
        if (this.fireButtonPressed && pointer.id === this.firePointerId) {
            this.fireButtonPressed = false
            this.firePointerId = -1
            this.inputManager?.setTouchState({ space: false })
            this.redraw()
        }

        if (this.movementTouch && pointer.id === this.movementTouch.id) {
            this.movementTouch = null
            this.inputManager?.setTouchState({
                left: false,
                right: false,
                up: false,
                down: false,
            })
            this.redraw()
        }
    }

    private updateMovementState() {
        if (!this.movementTouch || !this.inputManager) return

        const { deadZone } = TOUCH_CONTROLS_CONFIG.movement

        const deltaX = this.movementTouch.currentX - this.movementTouch.startX
        const deltaY = this.movementTouch.currentY - this.movementTouch.startY

        const isLeft = deltaX < -deadZone
        const isRight = deltaX > deadZone
        const isUp = deltaY < -deadZone
        const isDown = deltaY > deadZone

        this.inputManager.setTouchState({
            left: isLeft,
            right: isRight,
            up: isUp,
            down: isDown,
        })
    }

    private redraw() {
        this.drawControls()
    }

    destroy() {
        if (this.bombButtonTimeout) {
            clearTimeout(this.bombButtonTimeout)
            this.bombButtonTimeout = null
        }

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
        this.inputManager = null
        this.scene = null
    }
}
