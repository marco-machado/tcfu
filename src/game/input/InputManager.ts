export interface ICursorState {
    left: boolean
    right: boolean
    up: boolean
    down: boolean
    space: boolean
}

export class InputManager {
    private scene: Phaser.Scene | null
    private keyboardCursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined
    private touchState: ICursorState = {
        left: false,
        right: false,
        up: false,
        down: false,
        space: false,
    }
    private _isTouchDevice: boolean

    constructor(scene: Phaser.Scene) {
        this.scene = scene
        this._isTouchDevice = this.detectTouchDevice()
        this.keyboardCursors = scene.input.keyboard?.createCursorKeys()
    }

    private detectTouchDevice(): boolean {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0
    }

    setTouchState(state: Partial<ICursorState>) {
        this.touchState = { ...this.touchState, ...state }
    }

    getCursorState(): ICursorState {
        return {
            left: (this.keyboardCursors?.left?.isDown ?? false) || this.touchState.left,
            right: (this.keyboardCursors?.right?.isDown ?? false) || this.touchState.right,
            up: (this.keyboardCursors?.up?.isDown ?? false) || this.touchState.up,
            down: (this.keyboardCursors?.down?.isDown ?? false) || this.touchState.down,
            space: (this.keyboardCursors?.space?.isDown ?? false) || this.touchState.space,
        }
    }

    isTouchDevice(): boolean {
        return this._isTouchDevice
    }

    destroy() {
        this.keyboardCursors = undefined
        this.scene = null
    }
}
