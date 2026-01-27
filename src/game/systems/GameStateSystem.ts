import { GAME_STATE_CONFIG } from "../config/GameConfig"
import { ISystem } from "./ISystem"
import { PlayerPowerUpState } from "./PlayerPowerUpState"

export class GameStateSystem implements ISystem {
    private scene: Phaser.Scene | null
    private powerUpState: PlayerPowerUpState | null
    private score: number = 0
    private lives: number = GAME_STATE_CONFIG.initialLives
    private isGameOver: boolean = false

    constructor(scene: Phaser.Scene, powerUpState: PlayerPowerUpState) {
        this.scene = scene
        this.powerUpState = powerUpState
        this.setupEventListeners()
    }

    private setupEventListeners() {
        if (!this.scene) return
        this.scene.events.on('enemy-destroyed', this.handleEnemyDestroyed, this)
        this.scene.events.on('player-hit', this.handlePlayerHit, this)
        this.scene.events.on('powerup-extra-life', this.handleExtraLife, this)
    }

    private handleEnemyDestroyed(data: { points: number }) {
        if (this.isGameOver || !this.scene) return
        const multiplier = this.powerUpState?.getScoreMultiplier() ?? 1
        this.score += data.points * multiplier
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

    private handleExtraLife() {
        if (this.isGameOver || !this.scene) return
        if (this.lives >= GAME_STATE_CONFIG.maxLives) return
        this.lives++
        this.scene.events.emit('lives-changed', { lives: this.lives })
    }

    isLivesMaxed(): boolean {
        return this.lives >= GAME_STATE_CONFIG.maxLives
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
            this.scene.events.off('powerup-extra-life', this.handleExtraLife, this)
        }
        this.powerUpState = null
        this.scene = null
    }
}
