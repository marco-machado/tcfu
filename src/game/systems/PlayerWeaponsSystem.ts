import { POWERUP_CONFIG, WEAPON_CONFIG } from '../config/GameConfig'
import { Player } from '../entities/Player'
import { PlayerProjectile } from '../entities/weapons/PlayerProjectile'
import { ISystem } from './ISystem'
import { PermanentModifiers, PlayerPowerUpState } from './PlayerPowerUpState'

export class PlayerWeaponsSystem implements ISystem {
    private scene: Phaser.Scene | null
    private player: Player | null
    private projectilesGroup: Phaser.Physics.Arcade.Group | null
    private powerUpState: PlayerPowerUpState | null
    private lastFireTime = 0
    private baseCooldown = WEAPON_CONFIG.player.cooldown
    private cooldownReduction = 0
    private hasSpreadShot = false
    private damageMultiplier = 1
    private isPaused = false

    constructor(
        scene: Phaser.Scene,
        player: Player,
        projectilesGroup: Phaser.Physics.Arcade.Group,
        powerUpState: PlayerPowerUpState
    ) {
        this.scene = scene
        this.player = player
        this.projectilesGroup = projectilesGroup
        this.powerUpState = powerUpState

        this.scene.events.on('player-weapon-fired', this.handleWeaponFired, this)
        this.scene.events.on('powerup-modifiers-changed', this.handleModifiersChanged, this)
        this.scene.events.on('game-paused', this.handlePaused, this)
        this.scene.events.on('game-resumed', this.handleResumed, this)
        this.scene.physics.world.on(Phaser.Physics.Arcade.Events.WORLD_STEP, this.handleWorldStep, this)
    }

    private handlePaused() {
        this.isPaused = true
    }

    private handleResumed() {
        this.isPaused = false
    }

    private handleModifiersChanged(modifiers: PermanentModifiers) {
        this.cooldownReduction = modifiers.fireRateBonuses * POWERUP_CONFIG.permanent.fireRateReduction
        this.hasSpreadShot = modifiers.hasSpreadShot
        this.damageMultiplier = modifiers.damageMultiplier
    }

    private getEffectiveCooldown(): number {
        return Math.max(
            POWERUP_CONFIG.permanent.fireRateMinCooldown,
            this.baseCooldown - this.cooldownReduction
        )
    }

    handleWeaponFired() {
        if (!this.scene || this.isPaused) return
        const currentTime = this.scene.time.now

        if (currentTime - this.lastFireTime < this.getEffectiveCooldown()) {
            return
        }

        if (!this.player || !this.projectilesGroup) {
            return
        }

        const spawnY = this.player.y + WEAPON_CONFIG.player.spawnOffsetY

        if (this.hasSpreadShot) {
            const angles = POWERUP_CONFIG.permanent.spreadShotAngles
            angles.forEach(angleDeg => {
                const projectile = new PlayerProjectile(
                    this.scene!,
                    this.player!.x,
                    spawnY,
                    this.projectilesGroup!,
                    this.damageMultiplier
                )
                if (projectile.body && projectile.body instanceof Phaser.Physics.Arcade.Body) {
                    const angleRad = Phaser.Math.DegToRad(angleDeg - 90)
                    const speed = Math.abs(WEAPON_CONFIG.player.velocityY)
                    projectile.body.setVelocity(
                        Math.cos(angleRad) * speed,
                        Math.sin(angleRad) * speed
                    )
                    projectile.setRotation(Phaser.Math.DegToRad(angleDeg))
                }
            })
        } else {
            const projectile = new PlayerProjectile(
                this.scene,
                this.player.x,
                spawnY,
                this.projectilesGroup,
                this.damageMultiplier
            )
            if (projectile.body && projectile.body instanceof Phaser.Physics.Arcade.Body) {
                projectile.body.setVelocityY(WEAPON_CONFIG.player.velocityY)
            }
        }

        this.lastFireTime = currentTime
    }

    handleWorldStep() {
        if (!this.projectilesGroup) return
        this.projectilesGroup.getChildren().forEach((projectile: Phaser.GameObjects.GameObject) => {
            if (!projectile.active) {
                return
            }

            if (projectile instanceof Phaser.GameObjects.Sprite && projectile.y < WEAPON_CONFIG.player.cleanupThresholdY) {
                projectile.setActive(false).setVisible(false)
            }
        })
    }

    destroy() {
        if (this.scene) {
            this.scene.events.off('player-weapon-fired', this.handleWeaponFired, this)
            this.scene.events.off('powerup-modifiers-changed', this.handleModifiersChanged, this)
            this.scene.events.off('game-paused', this.handlePaused, this)
            this.scene.events.off('game-resumed', this.handleResumed, this)
            this.scene.physics.world.off(Phaser.Physics.Arcade.Events.WORLD_STEP, this.handleWorldStep, this)
        }

        this.projectilesGroup = null
        this.player = null
        this.powerUpState = null
        this.scene = null
    }
}
