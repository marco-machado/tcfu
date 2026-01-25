import { WAVE_CONFIG } from "../config/GameConfig"
import { ISystem } from "./ISystem"

export interface WaveState {
    currentWave: number
    killsInWave: number
    killsRequired: number
    spawnRate: number
    enemyVelocity: number
}

export class WaveSystem implements ISystem {
    private scene: Phaser.Scene | null
    private currentWave: number = 1
    private killsInWave: number = 0

    constructor(scene: Phaser.Scene) {
        this.scene = scene
        this.setupEventListeners()
        this.emitInitialState()
    }

    private setupEventListeners() {
        if (!this.scene) return
        this.scene.events.on('enemy-destroyed', this.handleEnemyDestroyed, this)
    }

    private emitInitialState() {
        if (!this.scene) return
        this.scene.events.emit('wave-started', this.getWaveState())
        this.scene.events.emit('wave-difficulty-changed', {
            spawnRate: this.calculateSpawnRate(),
            enemyVelocity: this.calculateEnemyVelocity(),
        })
    }

    private handleEnemyDestroyed() {
        if (!this.scene) return

        this.killsInWave++

        if (this.killsInWave >= this.getKillsRequired()) {
            this.advanceWave()
        }
    }

    private advanceWave() {
        if (!this.scene) return

        this.currentWave++
        this.killsInWave = 0

        const waveState = this.getWaveState()
        this.scene.events.emit('wave-started', waveState)
        this.scene.events.emit('wave-difficulty-changed', {
            spawnRate: waveState.spawnRate,
            enemyVelocity: waveState.enemyVelocity,
        })
    }

    private getKillsRequired(): number {
        return WAVE_CONFIG.baseKillsToComplete +
               (this.currentWave - 1) * WAVE_CONFIG.killsScalingPerWave
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
            killsInWave: this.killsInWave,
            killsRequired: this.getKillsRequired(),
            spawnRate: this.calculateSpawnRate(),
            enemyVelocity: this.calculateEnemyVelocity(),
        }
    }

    getCurrentWave(): number {
        return this.currentWave
    }

    destroy() {
        if (this.scene) {
            this.scene.events.off('enemy-destroyed', this.handleEnemyDestroyed, this)
        }
        this.scene = null
    }
}
