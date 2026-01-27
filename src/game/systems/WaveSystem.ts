import { WAVE_CONFIG } from "../config/GameConfig"
import { ISystem } from "./ISystem"

export interface WaveState {
    currentWave: number
    scoreInWave: number
    scoreRequired: number
    spawnRate: number
    enemyVelocity: number
}

export class WaveSystem implements ISystem {
    private scene: Phaser.Scene | null
    private currentWave: number = 1
    private scoreInWave: number = 0
    private totalScoreAtWaveStart: number = 0

    constructor(scene: Phaser.Scene) {
        this.scene = scene
        this.setupEventListeners()
        this.emitInitialState()
    }

    private setupEventListeners() {
        if (!this.scene) return
        this.scene.events.on('score-changed', this.handleScoreChanged, this)
    }

    private emitInitialState() {
        if (!this.scene) return
        this.scene.events.emit('wave-started', this.getWaveState())
        this.scene.events.emit('wave-difficulty-changed', {
            spawnRate: this.calculateSpawnRate(),
            enemyVelocity: this.calculateEnemyVelocity(),
        })
    }

    private handleScoreChanged(data: { score: number }) {
        if (!this.scene) return

        this.scoreInWave = data.score - this.totalScoreAtWaveStart

        if (this.scoreInWave >= this.getScoreRequired()) {
            this.advanceWave(data.score)
        }
    }

    private advanceWave(currentScore: number) {
        if (!this.scene) return

        this.currentWave++
        this.totalScoreAtWaveStart = currentScore
        this.scoreInWave = 0

        const waveState = this.getWaveState()
        this.scene.events.emit('wave-started', waveState)
        this.scene.events.emit('wave-difficulty-changed', {
            spawnRate: waveState.spawnRate,
            enemyVelocity: waveState.enemyVelocity,
        })
    }

    private getScoreRequired(): number {
        return WAVE_CONFIG.baseScoreToComplete +
               (this.currentWave - 1) * WAVE_CONFIG.scoreScalingPerWave
    }

    private calculateSpawnRate(): number {
        const reduction = (this.currentWave - 1) * WAVE_CONFIG.spawner.rateReductionPerWave
        return Math.max(
            WAVE_CONFIG.spawner.minRate,
            WAVE_CONFIG.spawner.baseRate - reduction
        )
    }

    private calculateEnemyVelocity(): number {
        const increase = (this.currentWave - 1) * WAVE_CONFIG.enemy.velocityIncreasePerWave
        return Math.min(
            WAVE_CONFIG.enemy.maxVelocityY,
            WAVE_CONFIG.enemy.baseVelocityY + increase
        )
    }

    getWaveState(): WaveState {
        return {
            currentWave: this.currentWave,
            scoreInWave: this.scoreInWave,
            scoreRequired: this.getScoreRequired(),
            spawnRate: this.calculateSpawnRate(),
            enemyVelocity: this.calculateEnemyVelocity(),
        }
    }

    getCurrentWave(): number {
        return this.currentWave
    }

    destroy() {
        if (this.scene) {
            this.scene.events.off('score-changed', this.handleScoreChanged, this)
        }
        this.scene = null
    }
}
