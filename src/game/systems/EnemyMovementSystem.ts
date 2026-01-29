import { GAME_CONFIG, WAVE_CONFIG } from "../config/GameConfig"
import { ISystem } from "./ISystem"

export enum MovementPattern {
    STRAIGHT = 'straight',
    SINE_WAVE = 'sineWave',
    DIAGONAL = 'diagonal',
    ZIGZAG = 'zigzag',
}

interface EnemyMovementData {
    pattern: MovementPattern
    spawnTime: number
    spawnX: number
    direction: number
    lastSwitchTime: number
}

export class EnemyMovementSystem implements ISystem {
    private scene: Phaser.Scene | null
    private enemiesGroup: Phaser.Physics.Arcade.Group | null
    private enemyData: Map<Phaser.GameObjects.GameObject, EnemyMovementData> = new Map()
    private currentWave = 1
    private patternWeights: { pattern: MovementPattern; weight: number }[]
    private totalWeight: number

    constructor(scene: Phaser.Scene, enemiesGroup: Phaser.Physics.Arcade.Group) {
        this.scene = scene
        this.enemiesGroup = enemiesGroup

        const { patterns } = WAVE_CONFIG.movement
        this.patternWeights = [
            { pattern: MovementPattern.STRAIGHT, weight: patterns.straight.weight },
            { pattern: MovementPattern.SINE_WAVE, weight: patterns.sineWave.weight },
            { pattern: MovementPattern.DIAGONAL, weight: patterns.diagonal.weight },
            { pattern: MovementPattern.ZIGZAG, weight: patterns.zigzag.weight },
        ]
        this.totalWeight = this.patternWeights.reduce((sum, p) => sum + p.weight, 0)

        this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this)
        this.scene.events.on('wave-started', this.handleWaveStarted, this)
        this.scene.events.on('enemy-spawned', this.handleEnemySpawned, this)

        this.scene.events.once(
            Phaser.Scenes.Events.SHUTDOWN,
            () => {
                if (this.scene) {
                    this.scene.events.off(Phaser.Scenes.Events.UPDATE, this.update, this)
                    this.scene.events.off('wave-started', this.handleWaveStarted, this)
                    this.scene.events.off('enemy-spawned', this.handleEnemySpawned, this)
                }
            },
            this
        )
    }

    private handleWaveStarted(data: { currentWave: number }) {
        this.currentWave = data.currentWave
    }

    handleEnemySpawned(enemy: Phaser.GameObjects.GameObject) {
        if (!this.scene) return

        const pattern = this.selectPattern()
        const spawnX = 'x' in enemy ? (enemy.x as number) : 0
        const direction = spawnX > GAME_CONFIG.width / 2 ? -1 : 1

        this.enemyData.set(enemy, {
            pattern,
            spawnTime: this.scene.time.now,
            spawnX,
            direction,
            lastSwitchTime: this.scene.time.now,
        })

        if (pattern === MovementPattern.DIAGONAL && enemy.body instanceof Phaser.Physics.Arcade.Body) {
            enemy.body.setVelocityX(WAVE_CONFIG.movement.patterns.diagonal.velocityX * direction)
        }

        enemy.once(Phaser.GameObjects.Events.DESTROY, () => {
            this.enemyData.delete(enemy)
        })
    }

    private selectPattern(): MovementPattern {
        if (this.currentWave < WAVE_CONFIG.movement.firstMovementWave) {
            return MovementPattern.STRAIGHT
        }

        let random = Math.random() * this.totalWeight
        for (const { pattern, weight } of this.patternWeights) {
            random -= weight
            if (random <= 0) return pattern
        }
        return MovementPattern.STRAIGHT
    }

    private update() {
        if (!this.scene || this.scene.physics.world.isPaused) return

        const currentTime = this.scene.time.now

        this.enemyData.forEach((data, enemy) => {
            if (!enemy.active || !enemy.body || !(enemy.body instanceof Phaser.Physics.Arcade.Body)) {
                return
            }

            switch (data.pattern) {
                case MovementPattern.SINE_WAVE:
                    this.updateSineWave(enemy, data, currentTime)
                    break
                case MovementPattern.ZIGZAG:
                    this.updateZigzag(enemy, data, currentTime)
                    break
                case MovementPattern.DIAGONAL:
                    this.updateDiagonal(enemy, data)
                    break
            }
        })
    }

    private updateSineWave(
        enemy: Phaser.GameObjects.GameObject,
        data: EnemyMovementData,
        currentTime: number
    ) {
        if (!(enemy.body instanceof Phaser.Physics.Arcade.Body)) return

        const { amplitude, frequency } = WAVE_CONFIG.movement.patterns.sineWave
        const elapsed = currentTime - data.spawnTime
        const targetX = data.spawnX + Math.sin(elapsed * frequency) * amplitude
        const currentX = 'x' in enemy ? (enemy.x as number) : 0
        const velocityX = (targetX - currentX) * 5

        enemy.body.setVelocityX(velocityX)
    }

    private updateZigzag(
        enemy: Phaser.GameObjects.GameObject,
        data: EnemyMovementData,
        currentTime: number
    ) {
        if (!(enemy.body instanceof Phaser.Physics.Arcade.Body)) return

        const { amplitude, switchInterval } = WAVE_CONFIG.movement.patterns.zigzag

        if (currentTime - data.lastSwitchTime > switchInterval) {
            data.direction *= -1
            data.lastSwitchTime = currentTime
        }

        const currentX = 'x' in enemy ? (enemy.x as number) : GAME_CONFIG.width / 2
        const padding = WAVE_CONFIG.spawner.spawnPaddingX

        if (currentX <= padding) {
            data.direction = 1
            data.lastSwitchTime = currentTime
        } else if (currentX >= GAME_CONFIG.width - padding) {
            data.direction = -1
            data.lastSwitchTime = currentTime
        }

        enemy.body.setVelocityX(amplitude * data.direction * 2)
    }

    private updateDiagonal(
        enemy: Phaser.GameObjects.GameObject,
        data: EnemyMovementData
    ) {
        if (!(enemy.body instanceof Phaser.Physics.Arcade.Body)) return

        const currentX = 'x' in enemy ? (enemy.x as number) : GAME_CONFIG.width / 2
        const padding = WAVE_CONFIG.spawner.spawnPaddingX

        if (currentX <= padding || currentX >= GAME_CONFIG.width - padding) {
            data.direction *= -1
            enemy.body.setVelocityX(WAVE_CONFIG.movement.patterns.diagonal.velocityX * data.direction)
        }
    }

    destroy() {
        if (this.scene) {
            this.scene.events.off(Phaser.Scenes.Events.UPDATE, this.update, this)
            this.scene.events.off('wave-started', this.handleWaveStarted, this)
            this.scene.events.off('enemy-spawned', this.handleEnemySpawned, this)
        }

        this.enemyData.clear()
        this.enemiesGroup = null
        this.scene = null
    }
}
