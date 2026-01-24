import { GAME_STATE_CONFIG } from "../config/GameConfig"
import { ISystem } from "./ISystem"

export class GameStateSystem implements ISystem {
    private scene: Phaser.Scene | null
    private score: number = 0
    private lives: number = GAME_STATE_CONFIG.initialLives
    private isGameOver: boolean = false

    constructor(scene: Phaser.Scene) {
        this.scene = scene
        this.setupEventListeners()
    }

    private setupEventListeners() {
        if (!this.scene) return
        this.scene.events.on('enemy-destroyed', this.handleEnemyDestroyed, this)
        this.scene.events.on('player-hit', this.handlePlayerHit, this)
    }

    private handleEnemyDestroyed(data: { points: number }) {
        if (this.isGameOver || !this.scene) return
        this.score += data.points
        this.scene.events.emit('score-changed', { score: this.score })
    }

    private handlePlayerHit() {
        if (this.isGameOver || !this.scene) return
        this.lives--
        this.scene.events.emit('lives-changed', { lives: this.lives })

        if (this.lives <= 0) {
            this.isGameOver = true
            this.scene.events.emit('game-over')
        }
    }

    getScore(): number {
        return this.score
    }

    getLives(): number {
        return this.lives
    }

    getIsGameOver(): boolean {
        return this.isGameOver
    }

    destroy() {
        if (this.scene) {
            this.scene.events.off('enemy-destroyed', this.handleEnemyDestroyed, this)
            this.scene.events.off('player-hit', this.handlePlayerHit, this)
        }
        this.scene = null
    }
}
