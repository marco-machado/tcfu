import { WEAPON_CONFIG } from '../config/GameConfig'
import { EnemyProjectile } from '../entities/weapons/EnemyProjectile'
import { ISystem } from './ISystem'

export class EnemyWeaponsSystem implements ISystem {
    private scene: Phaser.Scene | null
    private enemiesGroup: Phaser.Physics.Arcade.Group | null
    private projectilesGroup: Phaser.Physics.Arcade.Group | null
    private enemyFireTimers: Map<number, number> = new Map()
    private currentWave = 1
    private canShoot = false

    constructor(
        scene: Phaser.Scene,
        enemiesGroup: Phaser.Physics.Arcade.Group,
        projectilesGroup: Phaser.Physics.Arcade.Group
    ) {
        this.scene = scene
        this.enemiesGroup = enemiesGroup
        this.projectilesGroup = projectilesGroup

        this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this)
        this.scene.events.on('wave-started', this.handleWaveStarted, this)

        this.scene.events.once(
            Phaser.Scenes.Events.SHUTDOWN,
            () => {
                if (this.scene) {
                    this.scene.events.off(Phaser.Scenes.Events.UPDATE, this.update, this)
                    this.scene.events.off('wave-started', this.handleWaveStarted, this)
                }
            },
            this
        )
    }

    private handleWaveStarted(data: { currentWave: number }) {
        this.currentWave = data.currentWave
        this.canShoot = this.currentWave >= WEAPON_CONFIG.enemy.firstShootingWave
    }

    private update() {
        if (!this.scene || !this.canShoot || this.scene.physics.world.isPaused) return

        const currentTime = this.scene.time.now

        this.enemiesGroup?.getChildren().forEach((enemy: Phaser.GameObjects.GameObject) => {
            if (!enemy.active) return

            const enemyId = (enemy as any).__enemyId ?? this.assignEnemyId(enemy)
            const nextFireTime = this.enemyFireTimers.get(enemyId)

            if (nextFireTime === undefined) {
                this.scheduleNextFire(enemyId, currentTime)
                return
            }

            if (currentTime >= nextFireTime) {
                this.fireProjectile(enemy as Phaser.GameObjects.Container)
                this.scheduleNextFire(enemyId, currentTime)
            }
        })

        this.cleanupOffScreenProjectiles()
        this.cleanupDeadEnemyTimers()
    }

    private assignEnemyId(enemy: Phaser.GameObjects.GameObject): number {
        const id = Math.random() * 1000000
        ;(enemy as any).__enemyId = id
        return id
    }

    private scheduleNextFire(enemyId: number, currentTime: number) {
        const cooldown = Phaser.Math.Between(
            WEAPON_CONFIG.enemy.cooldownMin,
            WEAPON_CONFIG.enemy.cooldownMax
        )
        this.enemyFireTimers.set(enemyId, currentTime + cooldown)
    }

    private fireProjectile(enemy: Phaser.GameObjects.Container) {
        if (!this.scene || !this.projectilesGroup) return

        const spawnY = enemy.y + WEAPON_CONFIG.enemy.spawnOffsetY
        const projectile = new EnemyProjectile(this.scene, enemy.x, spawnY, this.projectilesGroup)

        if (projectile.body && projectile.body instanceof Phaser.Physics.Arcade.Body) {
            projectile.body.setVelocityY(WEAPON_CONFIG.enemy.velocityY)
        }
    }

    private cleanupOffScreenProjectiles() {
        if (!this.scene || !this.projectilesGroup) return
        const cleanupThreshold = this.scene.scale.height + 50

        this.projectilesGroup.getChildren().forEach((projectile: Phaser.GameObjects.GameObject) => {
            if (projectile instanceof Phaser.GameObjects.Sprite && projectile.y > cleanupThreshold) {
                projectile.destroy()
            }
        })
    }

    private cleanupDeadEnemyTimers() {
        if (!this.enemiesGroup) return

        const activeEnemyIds = new Set<number>()
        this.enemiesGroup.getChildren().forEach((enemy: Phaser.GameObjects.GameObject) => {
            const id = (enemy as any).__enemyId
            if (id !== undefined) {
                activeEnemyIds.add(id)
            }
        })

        this.enemyFireTimers.forEach((_, enemyId) => {
            if (!activeEnemyIds.has(enemyId)) {
                this.enemyFireTimers.delete(enemyId)
            }
        })
    }

    destroy() {
        if (this.scene) {
            this.scene.events.off(Phaser.Scenes.Events.UPDATE, this.update, this)
            this.scene.events.off('wave-started', this.handleWaveStarted, this)
        }

        this.enemyFireTimers.clear()
        this.projectilesGroup = null
        this.enemiesGroup = null
        this.scene = null
    }
}
