import { POWERUP_CONFIG } from "../config/GameConfig"
import { PowerUpType } from "../entities/powerups"

export interface TimedEffect {
    type: PowerUpType
    endTime: number
    timerEvent: Phaser.Time.TimerEvent
}

export interface PermanentModifiers {
    fireRateBonuses: number
    damageMultiplier: number
    hasSpreadShot: boolean
    speedBonuses: number
}

export class PlayerPowerUpState {
    private scene: Phaser.Scene | null
    private timedEffects: Map<PowerUpType, TimedEffect> = new Map()
    private permanentModifiers: PermanentModifiers = {
        fireRateBonuses: 0,
        damageMultiplier: 1,
        hasSpreadShot: false,
        speedBonuses: 0,
    }
    private hasShield: boolean = false
    private bombCount: number = POWERUP_CONFIG.bombs.initialBombs

    constructor(scene: Phaser.Scene) {
        this.scene = scene
        this.setupEventListeners()
    }

    emitInitialState() {
        this.scene?.events.emit('bombs-changed', { bombs: this.bombCount })
    }

    private setupEventListeners() {
        if (!this.scene) return

        this.scene.events.on('powerup-fire-rate-up', this.addFireRateBonus, this)
        this.scene.events.on('powerup-damage-up', this.addDamageBonus, this)
        this.scene.events.on('powerup-spread-shot', this.enableSpreadShot, this)
        this.scene.events.on('powerup-speed-up', this.addSpeedBonus, this)
        this.scene.events.on('powerup-invincibility-start', this.handleInvincibilityStart, this)
        this.scene.events.on('powerup-shield-start', this.handleShieldStart, this)
        this.scene.events.on('powerup-magnet-start', this.handleMagnetStart, this)
        this.scene.events.on('powerup-score-multiplier-start', this.handleScoreMultiplierStart, this)
        this.scene.events.on('powerup-bomb-collected', this.addBomb, this)
        this.scene.events.on('bomb-activated', this.useBomb, this)
        this.scene.events.on('game-over', this.resetPermanentModifiers, this)
        this.scene.events.on('game-paused', this.handlePaused, this)
        this.scene.events.on('game-resumed', this.handleResumed, this)
    }

    private handlePaused() {
        this.timedEffects.forEach(effect => {
            effect.timerEvent.paused = true
        })
    }

    private handleResumed() {
        this.timedEffects.forEach(effect => {
            effect.timerEvent.paused = false
        })
    }

    private addFireRateBonus() {
        this.permanentModifiers.fireRateBonuses++
        this.scene?.events.emit('powerup-modifiers-changed', this.getModifiers())
    }

    private addDamageBonus() {
        const maxStacks = POWERUP_CONFIG.permanent.maxDamageStacks
        const maxMultiplier = Math.pow(POWERUP_CONFIG.permanent.damageMultiplier, maxStacks)
        if (this.permanentModifiers.damageMultiplier < maxMultiplier) {
            this.permanentModifiers.damageMultiplier *= POWERUP_CONFIG.permanent.damageMultiplier
        }
        this.scene?.events.emit('powerup-modifiers-changed', this.getModifiers())
    }

    private enableSpreadShot() {
        this.permanentModifiers.hasSpreadShot = true
        this.scene?.events.emit('powerup-modifiers-changed', this.getModifiers())
    }

    private addSpeedBonus() {
        if (this.permanentModifiers.speedBonuses < POWERUP_CONFIG.permanent.maxSpeedBonuses) {
            this.permanentModifiers.speedBonuses++
            this.scene?.events.emit('powerup-modifiers-changed', this.getModifiers())
        }
    }

    private addBomb() {
        if (this.bombCount < POWERUP_CONFIG.bombs.maxBombs) {
            this.bombCount++
            this.scene?.events.emit('bombs-changed', { bombs: this.bombCount })
        }
    }

    private useBomb() {
        if (this.bombCount > 0) {
            this.bombCount--
            this.scene?.events.emit('bombs-changed', { bombs: this.bombCount })
            this.scene?.events.emit('screen-clear-activated')
        }
    }

    private handleInvincibilityStart() {
        this.startTimedEffect(PowerUpType.INVINCIBILITY)
    }

    private handleShieldStart() {
        this.startShield()
    }

    private handleMagnetStart() {
        this.startTimedEffect(PowerUpType.MAGNET)
    }

    private handleScoreMultiplierStart() {
        this.startTimedEffect(PowerUpType.SCORE_MULTIPLIER)
    }

    private startTimedEffect(type: PowerUpType) {
        if (!this.scene) return

        const existingEffect = this.timedEffects.get(type)
        if (existingEffect) {
            existingEffect.timerEvent.remove()
        }

        const duration = this.getDurationForType(type)
        const timerEvent = this.scene.time.delayedCall(duration, () => {
            this.endTimedEffect(type)
        })

        this.timedEffects.set(type, {
            type,
            endTime: this.scene.time.now + duration,
            timerEvent,
        })

        this.scene.events.emit('powerup-timed-started', { type, duration })
    }

    private startShield() {
        this.hasShield = true
        this.startTimedEffect(PowerUpType.SHIELD)
        this.scene?.events.emit('powerup-shield-active', true)
    }

    private endTimedEffect(type: PowerUpType) {
        this.timedEffects.delete(type)
        if (type === PowerUpType.SHIELD) {
            this.hasShield = false
            this.scene?.events.emit('powerup-shield-active', false)
        }
        this.scene?.events.emit('powerup-timed-ended', { type })
    }

    private getDurationForType(type: PowerUpType): number {
        switch (type) {
            case PowerUpType.INVINCIBILITY: return POWERUP_CONFIG.durations.invincibility
            case PowerUpType.SHIELD: return POWERUP_CONFIG.durations.shield
            case PowerUpType.MAGNET: return POWERUP_CONFIG.durations.magnet
            case PowerUpType.SCORE_MULTIPLIER: return POWERUP_CONFIG.durations.scoreMultiplier
            default: return 0
        }
    }

    consumeShield(): boolean {
        if (!this.hasShield) return false

        this.hasShield = false
        const shieldEffect = this.timedEffects.get(PowerUpType.SHIELD)
        if (shieldEffect) {
            shieldEffect.timerEvent.remove()
            this.timedEffects.delete(PowerUpType.SHIELD)
        }
        this.scene?.events.emit('powerup-shield-active', false)
        this.scene?.events.emit('powerup-shield-absorbed')
        return true
    }

    getModifiers(): PermanentModifiers {
        return { ...this.permanentModifiers }
    }

    getFireCooldownReduction(): number {
        return this.permanentModifiers.fireRateBonuses * POWERUP_CONFIG.permanent.fireRateReduction
    }

    getDamageMultiplier(): number {
        return this.permanentModifiers.damageMultiplier
    }

    hasSpreadShot(): boolean {
        return this.permanentModifiers.hasSpreadShot
    }

    isSpeedMaxed(): boolean {
        return this.permanentModifiers.speedBonuses >= POWERUP_CONFIG.permanent.maxSpeedBonuses
    }

    isFireRateMaxed(): boolean {
        return this.permanentModifiers.fireRateBonuses >= POWERUP_CONFIG.permanent.maxFireRateStacks
    }

    isDamageMaxed(): boolean {
        return this.permanentModifiers.damageMultiplier >=
            Math.pow(POWERUP_CONFIG.permanent.damageMultiplier, POWERUP_CONFIG.permanent.maxDamageStacks)
    }

    getSpeedBonus(): number {
        return this.permanentModifiers.speedBonuses * POWERUP_CONFIG.permanent.speedBonus
    }

    getBombCount(): number {
        return this.bombCount
    }

    isBombsMaxed(): boolean {
        return this.bombCount >= POWERUP_CONFIG.bombs.maxBombs
    }

    isInvincible(): boolean {
        return this.timedEffects.has(PowerUpType.INVINCIBILITY)
    }

    hasActiveShield(): boolean {
        return this.hasShield
    }

    hasMagnet(): boolean {
        return this.timedEffects.has(PowerUpType.MAGNET)
    }

    getScoreMultiplier(): number {
        return this.timedEffects.has(PowerUpType.SCORE_MULTIPLIER)
            ? POWERUP_CONFIG.scoreMultiplierValue
            : 1
    }

    getActiveTimedEffects(): TimedEffect[] {
        return Array.from(this.timedEffects.values())
    }

    resetPermanentModifiers() {
        this.permanentModifiers = {
            fireRateBonuses: 0,
            damageMultiplier: 1,
            hasSpreadShot: false,
            speedBonuses: 0,
        }
        this.scene?.events.emit('powerup-modifiers-changed', this.getModifiers())
    }

    destroy() {
        this.timedEffects.forEach(effect => effect.timerEvent.remove())
        this.timedEffects.clear()
        if (this.scene) {
            this.scene.events.off('powerup-fire-rate-up', this.addFireRateBonus, this)
            this.scene.events.off('powerup-damage-up', this.addDamageBonus, this)
            this.scene.events.off('powerup-spread-shot', this.enableSpreadShot, this)
            this.scene.events.off('powerup-speed-up', this.addSpeedBonus, this)
            this.scene.events.off('powerup-invincibility-start', this.handleInvincibilityStart, this)
            this.scene.events.off('powerup-shield-start', this.handleShieldStart, this)
            this.scene.events.off('powerup-magnet-start', this.handleMagnetStart, this)
            this.scene.events.off('powerup-score-multiplier-start', this.handleScoreMultiplierStart, this)
            this.scene.events.off('powerup-bomb-collected', this.addBomb, this)
            this.scene.events.off('bomb-activated', this.useBomb, this)
            this.scene.events.off('game-over', this.resetPermanentModifiers, this)
            this.scene.events.off('game-paused', this.handlePaused, this)
            this.scene.events.off('game-resumed', this.handleResumed, this)
        }
        this.scene = null
    }
}
