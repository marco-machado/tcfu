import { WAVE_CONFIG } from "../config/GameConfig"
import { KlaedScout } from "../entities/KlaedScout"
import { ISystem } from "./ISystem"

interface FormationPattern {
  cols: number
  rows: number
  weight: number
}

export class EnemySpawnerSystem implements ISystem {
  private scene: Phaser.Scene | null
  private enemiesGroup: Phaser.Physics.Arcade.Group | null
  private lastSpawnTime = 0
  private spawnRate = WAVE_CONFIG.spawner.baseRate
  private enemyVelocity = WAVE_CONFIG.enemy.baseVelocityY
  private formationPatterns: FormationPattern[] = WAVE_CONFIG.formations.patterns
  private totalWeight: number
  private currentWave = 1

  constructor(scene: Phaser.Scene, enemiesGroup: Phaser.Physics.Arcade.Group) {
    this.scene = scene
    this.enemiesGroup = enemiesGroup
    this.totalWeight = this.formationPatterns.reduce((sum, p) => sum + p.weight, 0)

    this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this)
    this.scene.events.on('wave-difficulty-changed', this.handleDifficultyChanged, this)
    this.scene.events.on('wave-started', this.handleWaveStarted, this)

    this.scene.events.once(
      Phaser.Scenes.Events.SHUTDOWN,
      () => {
        if (this.scene) {
          this.scene.events.off(Phaser.Scenes.Events.UPDATE, this.update, this)
          this.scene.events.off('wave-difficulty-changed', this.handleDifficultyChanged, this)
          this.scene.events.off('wave-started', this.handleWaveStarted, this)
        }
      },
      this
    )
  }

  private handleDifficultyChanged(data: { spawnRate: number; enemyVelocity: number }) {
    this.spawnRate = data.spawnRate
    this.enemyVelocity = data.enemyVelocity
  }

  private handleWaveStarted(data: { currentWave: number }) {
    this.currentWave = data.currentWave
  }

  private update() {
    if (!this.scene || this.scene.physics.world.isPaused) return
    const currentTime = this.scene.time.now

    if (currentTime - this.lastSpawnTime > this.spawnRate) {
      this.spawnFormation()
      this.lastSpawnTime = currentTime
    }

    this.cleanupOffScreenEnemies()
  }

  private selectFormation(): FormationPattern {
    if (this.currentWave < WAVE_CONFIG.formations.firstFormationWave) {
      return { cols: 1, rows: 1, weight: 1 }
    }

    let random = Math.random() * this.totalWeight
    for (const pattern of this.formationPatterns) {
      random -= pattern.weight
      if (random <= 0) return pattern
    }
    return this.formationPatterns[0]
  }

  private spawnFormation() {
    if (!this.scene || !this.enemiesGroup) return

    const formation = this.selectFormation()
    const { cols, rows } = formation
    const { spacingX, spacingY } = WAVE_CONFIG.formations
    const padding = WAVE_CONFIG.spawner.spawnPaddingX

    const formationWidth = (cols - 1) * spacingX
    const minX = padding + formationWidth / 2
    const maxX = this.scene.scale.width - padding - formationWidth / 2
    const centerX = Phaser.Math.Between(minX, maxX)
    const startX = centerX - formationWidth / 2

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = startX + col * spacingX
        const y = WAVE_CONFIG.spawner.spawnY - row * spacingY

        const enemy = new KlaedScout(this.scene)
        enemy.setPosition(x, y)

        this.enemiesGroup.add(enemy)

        if (enemy.body && enemy.body instanceof Phaser.Physics.Arcade.Body) {
          enemy.body.setVelocityY(this.enemyVelocity)
        }

        this.scene.events.emit('enemy-spawned', enemy)
      }
    }
  }

  private cleanupOffScreenEnemies() {
    if (!this.scene || !this.enemiesGroup) return
    const cleanupThreshold = this.scene.scale.height + WAVE_CONFIG.spawner.cleanupOffsetY
    this.enemiesGroup.children.entries.forEach(
      (enemy: Phaser.GameObjects.GameObject) => {
        if (
          "y" in enemy &&
          typeof enemy.y === "number" &&
          enemy.y > cleanupThreshold
        ) {
          this.enemiesGroup!.remove(enemy)
          enemy.destroy()
        }
      }
    )
  }

  destroy() {
    if (this.scene) {
      this.scene.events.off(Phaser.Scenes.Events.UPDATE, this.update, this)
      this.scene.events.off('wave-difficulty-changed', this.handleDifficultyChanged, this)
      this.scene.events.off('wave-started', this.handleWaveStarted, this)
    }

    this.lastSpawnTime = 0
    this.enemiesGroup = null
    this.scene = null
  }
}
