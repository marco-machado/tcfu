import { GAME_CONFIG, POWERUP_CONFIG } from "../config/GameConfig"
import {
    Bomb,
    DamageUp,
    ExtraLife,
    FireRateUp,
    Invincibility,
    Magnet,
    PowerUp,
    PowerUpType,
    ScoreMultiplier,
    Shield,
    SpeedUp,
    SpreadShot,
} from "../entities/powerups"
import { Player } from "../entities/Player"
import { GameStateSystem } from "./GameStateSystem"
import { ISystem } from "./ISystem"
import { PlayerPowerUpState } from "./PlayerPowerUpState"

interface PowerUpTypeConfig {
    weight: number
    assetKey: string
}

export class PowerUpSystem implements ISystem {
    private scene: Phaser.Scene | null
    private player: Player | null
    private powerUpState: PlayerPowerUpState | null
    private gameStateSystem: GameStateSystem | null
    private powerUpsGroup: Phaser.Physics.Arcade.Group | null
    private lastRandomSpawnTime: number = 0
    private typeWeights: Map<PowerUpType, number> = new Map()
    private totalWeight: number = 0

    constructor(
        scene: Phaser.Scene,
        player: Player,
        powerUpState: PlayerPowerUpState,
        gameStateSystem: GameStateSystem,
        powerUpsGroup: Phaser.Physics.Arcade.Group
    ) {
        this.scene = scene
        this.player = player
        this.powerUpState = powerUpState
        this.gameStateSystem = gameStateSystem
        this.powerUpsGroup = powerUpsGroup

        this.initializeWeights()
        this.setupEventListeners()
    }

    private initializeWeights() {
        const types = POWERUP_CONFIG.types
        Object.entries(types).forEach(([key, config]) => {
            this.typeWeights.set(key as PowerUpType, (config as PowerUpTypeConfig).weight)
            this.totalWeight += (config as PowerUpTypeConfig).weight
        })
    }

    private setupEventListeners() {
        if (!this.scene) return

        this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this)
        this.scene.events.on('enemy-destroyed', this.handleEnemyDestroyed, this)
        if (GAME_CONFIG.debug) {
            this.scene.events.on('debug-spawn-powerup', this.handleDebugSpawn, this)
        }
    }

    private update() {
        if (!this.scene || this.scene.physics.world.isPaused) return

        this.handleRandomSpawn()
        this.handleMagnetAttraction()
        this.cleanupOffScreenPowerUps()
    }

    private handleRandomSpawn() {
        if (!this.scene) return

        const currentTime = this.scene.time.now
        if (currentTime - this.lastRandomSpawnTime > POWERUP_CONFIG.spawner.randomSpawnInterval) {
            this.spawnRandomPowerUp()
            this.lastRandomSpawnTime = currentTime
        }
    }

    private handleEnemyDestroyed(data: { points: number; x?: number; y?: number }) {
        if (!this.scene) return

        if (data.x !== undefined && data.y !== undefined) {
            if (Math.random() < POWERUP_CONFIG.spawner.dropChanceOnEnemyDeath) {
                this.spawnPowerUpAt(data.x, data.y)
            }
        }
    }

    private handleDebugSpawn(data: { type: PowerUpType }) {
        if (!this.scene || !this.player || !this.powerUpsGroup) return

        const x = this.player.x
        const y = 50
        const powerUp = this.createPowerUp(data.type, x, y)

        if (powerUp) {
            this.powerUpsGroup.add(powerUp)
            if (powerUp.body && powerUp.body instanceof Phaser.Physics.Arcade.Body) {
                powerUp.body.setVelocityY(POWERUP_CONFIG.spawner.velocityY)
            }
        }
    }

    private spawnRandomPowerUp() {
        if (!this.scene) return

        const padding = POWERUP_CONFIG.spawner.spawnPaddingX
        const x = Phaser.Math.Between(padding, GAME_CONFIG.width - padding)
        const y = POWERUP_CONFIG.spawner.spawnY

        this.spawnPowerUpAt(x, y)
    }

    private spawnPowerUpAt(x: number, y: number) {
        if (!this.scene || !this.powerUpsGroup) return

        const type = this.selectRandomType()
        const powerUp = this.createPowerUp(type, x, y)

        if (powerUp) {
            this.powerUpsGroup.add(powerUp)

            if (powerUp.body && powerUp.body instanceof Phaser.Physics.Arcade.Body) {
                powerUp.body.setVelocityY(POWERUP_CONFIG.spawner.velocityY)
            }
        }
    }

    private selectRandomType(): PowerUpType {
        let availableWeight = this.totalWeight
        const excludedTypes: Set<PowerUpType> = new Set()

        if (this.powerUpState?.hasSpreadShot()) {
            excludedTypes.add(PowerUpType.SPREAD_SHOT)
            availableWeight -= this.typeWeights.get(PowerUpType.SPREAD_SHOT) ?? 0
        }

        if (this.powerUpState?.isSpeedMaxed()) {
            excludedTypes.add(PowerUpType.SPEED_UP)
            availableWeight -= this.typeWeights.get(PowerUpType.SPEED_UP) ?? 0
        }

        if (this.powerUpState?.isBombsMaxed()) {
            excludedTypes.add(PowerUpType.BOMB)
            availableWeight -= this.typeWeights.get(PowerUpType.BOMB) ?? 0
        }

        if (this.gameStateSystem?.isLivesMaxed()) {
            excludedTypes.add(PowerUpType.EXTRA_LIFE)
            availableWeight -= this.typeWeights.get(PowerUpType.EXTRA_LIFE) ?? 0
        }

        if (this.powerUpState?.isFireRateMaxed()) {
            excludedTypes.add(PowerUpType.FIRE_RATE_UP)
            availableWeight -= this.typeWeights.get(PowerUpType.FIRE_RATE_UP) ?? 0
        }

        if (this.powerUpState?.isDamageMaxed()) {
            excludedTypes.add(PowerUpType.DAMAGE_UP)
            availableWeight -= this.typeWeights.get(PowerUpType.DAMAGE_UP) ?? 0
        }

        if (availableWeight <= 0) return PowerUpType.SCORE_MULTIPLIER

        let random = Math.random() * availableWeight
        for (const [type, weight] of this.typeWeights) {
            if (excludedTypes.has(type)) continue
            random -= weight
            if (random <= 0) return type
        }
        return PowerUpType.SCORE_MULTIPLIER
    }

    private createPowerUp(type: PowerUpType, x: number, y: number): PowerUp | null {
        if (!this.scene) return null

        switch (type) {
            case PowerUpType.EXTRA_LIFE: return new ExtraLife(this.scene, x, y)
            case PowerUpType.FIRE_RATE_UP: return new FireRateUp(this.scene, x, y)
            case PowerUpType.DAMAGE_UP: return new DamageUp(this.scene, x, y)
            case PowerUpType.SPREAD_SHOT: return new SpreadShot(this.scene, x, y)
            case PowerUpType.SPEED_UP: return new SpeedUp(this.scene, x, y)
            case PowerUpType.INVINCIBILITY: return new Invincibility(this.scene, x, y)
            case PowerUpType.SHIELD: return new Shield(this.scene, x, y)
            case PowerUpType.MAGNET: return new Magnet(this.scene, x, y)
            case PowerUpType.SCORE_MULTIPLIER: return new ScoreMultiplier(this.scene, x, y)
            case PowerUpType.BOMB: return new Bomb(this.scene, x, y)
            default: return null
        }
    }

    private handleMagnetAttraction() {
        if (!this.scene || !this.player || !this.powerUpState || !this.powerUpsGroup) return
        if (!this.powerUpState.hasMagnet()) return

        const player = this.player
        const magnetRadius = POWERUP_CONFIG.spawner.magnetRadius
        const magnetSpeed = POWERUP_CONFIG.spawner.magnetSpeed

        this.powerUpsGroup.getChildren().forEach((obj: Phaser.GameObjects.GameObject) => {
            if (!(obj instanceof PowerUp)) return
            if (!obj.active) return

            const distance = Phaser.Math.Distance.Between(player.x, player.y, obj.x, obj.y)
            if (distance < magnetRadius) {
                const angle = Phaser.Math.Angle.Between(obj.x, obj.y, player.x, player.y)
                if (obj.body && obj.body instanceof Phaser.Physics.Arcade.Body) {
                    obj.body.setVelocity(
                        Math.cos(angle) * magnetSpeed,
                        Math.sin(angle) * magnetSpeed
                    )
                }
            }
        })
    }


    private cleanupOffScreenPowerUps() {
        if (!this.scene || !this.powerUpsGroup) return

        const cleanupY = GAME_CONFIG.height + POWERUP_CONFIG.spawner.cleanupOffsetY

        this.powerUpsGroup.getChildren().forEach((obj: Phaser.GameObjects.GameObject) => {
            if ('y' in obj && typeof obj.y === 'number' && obj.y > cleanupY) {
                this.powerUpsGroup!.remove(obj)
                obj.destroy()
            }
        })
    }

    destroy() {
        if (this.scene) {
            this.scene.events.off(Phaser.Scenes.Events.UPDATE, this.update, this)
            this.scene.events.off('enemy-destroyed', this.handleEnemyDestroyed, this)
            if (GAME_CONFIG.debug) {
                this.scene.events.off('debug-spawn-powerup', this.handleDebugSpawn, this)
            }
        }

        this.typeWeights.clear()
        this.powerUpsGroup = null
        this.player = null
        this.powerUpState = null
        this.gameStateSystem = null
        this.scene = null
    }
}
