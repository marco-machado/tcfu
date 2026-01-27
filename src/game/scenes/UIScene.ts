import { Scene } from "phaser"
import { GAME_CONFIG, GAME_STATE_CONFIG, POWERUP_CONFIG, UI_CONFIG } from "../config/GameConfig"
import { PowerUpType } from "../entities/powerups"
import { PermanentModifiers } from "../systems/PlayerPowerUpState"
import { HighScoreManager } from "../utils/HighScoreManager"

interface TimedEffectUI {
    container: Phaser.GameObjects.Container
    progressBar: Phaser.GameObjects.Rectangle
    tween: Phaser.Tweens.Tween
}

export class UIScene extends Scene {
    private scoreText: Phaser.GameObjects.Text
    private livesText: Phaser.GameObjects.Text
    private waveText: Phaser.GameObjects.Text
    private gameOverText: Phaser.GameObjects.Text | null = null
    private pauseText: Phaser.GameObjects.Text | null = null
    private debugKeysText: Phaser.GameObjects.Text | null = null
    private restartKey: Phaser.Input.Keyboard.Key | null = null
    private menuKey: Phaser.Input.Keyboard.Key | null = null
    private currentScore: number = 0
    private timedEffectsContainer: Phaser.GameObjects.Container | null = null
    private timedEffectUIs: Map<PowerUpType, TimedEffectUI> = new Map()
    private bombText: Phaser.GameObjects.Text
    private damageText: Phaser.GameObjects.Text
    private fireRateText: Phaser.GameObjects.Text
    private speedText: Phaser.GameObjects.Text

    constructor() {
        super('UIScene')
    }

    create() {
        this.scene.bringToTop()

        const gameScene = this.scene.get('GameScene')

        this.livesText = this.add.text(20, 20, `Lives: ${GAME_STATE_CONFIG.initialLives}`, {
            fontFamily: 'KenVector Future',
            fontSize: '16px',
            color: '#ffffff'
        })

        this.scoreText = this.add.text(this.scale.width - 20, 20, 'Score: 0', {
            fontFamily: 'KenVector Future',
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(1, 0)

        this.waveText = this.add.text(this.scale.width / 2, 20, 'Wave 1', {
            fontFamily: 'KenVector Future',
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0.5, 0)

        const initialBombs = POWERUP_CONFIG.bombs.initialBombs
        const filledBom = '●'.repeat(initialBombs)
        const emptyBom = '○'.repeat(POWERUP_CONFIG.bombs.maxBombs - initialBombs)
        this.bombText = this.add.text(20, 45, `BOM: ${filledBom}${emptyBom}`, {
            fontFamily: 'KenVector Future',
            fontSize: '12px',
            color: '#ff6600'
        })

        const emptyDmg = '○'.repeat(POWERUP_CONFIG.permanent.maxDamageStacks)
        this.damageText = this.add.text(80, 45, `DMG: ${emptyDmg}`, {
            fontFamily: 'KenVector Future',
            fontSize: '12px',
            color: '#ff4444'
        })

        const emptyFr = '○'.repeat(POWERUP_CONFIG.permanent.maxFireRateStacks)
        this.fireRateText = this.add.text(145, 45, `FR: ${emptyFr}`, {
            fontFamily: 'KenVector Future',
            fontSize: '12px',
            color: '#ffaa00'
        })

        const emptySpd = '○'.repeat(POWERUP_CONFIG.permanent.maxSpeedBonuses)
        this.speedText = this.add.text(215, 45, `SPD: ${emptySpd}`, {
            fontFamily: 'KenVector Future',
            fontSize: '12px',
            color: '#88ffff'
        })

        this.timedEffectsContainer = this.add.container(this.scale.width / 2, this.scale.height - UI_CONFIG.hud.timedEffectsContainerOffsetY)

        gameScene.events.on('wave-started', this.handleWaveStarted, this)
        gameScene.events.on('score-changed', this.updateScore, this)
        gameScene.events.on('lives-changed', this.updateLives, this)
        gameScene.events.on('game-over', this.showGameOver, this)
        gameScene.events.on('game-paused', this.showPaused, this)
        gameScene.events.on('game-resumed', this.hidePaused, this)
        gameScene.events.on('powerup-timed-started', this.showTimedEffect, this)
        gameScene.events.on('powerup-timed-ended', this.hideTimedEffect, this)
        gameScene.events.on('bombs-changed', this.updateBombs, this)
        gameScene.events.on('powerup-modifiers-changed', this.updateModifiers, this)

        gameScene.events.emit('ui-ready')

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            gameScene.events.off('wave-started', this.handleWaveStarted, this)
            gameScene.events.off('score-changed', this.updateScore, this)
            gameScene.events.off('lives-changed', this.updateLives, this)
            gameScene.events.off('game-over', this.showGameOver, this)
            gameScene.events.off('game-paused', this.showPaused, this)
            gameScene.events.off('game-resumed', this.hidePaused, this)
            gameScene.events.off('powerup-timed-started', this.showTimedEffect, this)
            gameScene.events.off('powerup-timed-ended', this.hideTimedEffect, this)
            gameScene.events.off('bombs-changed', this.updateBombs, this)
            gameScene.events.off('powerup-modifiers-changed', this.updateModifiers, this)
            this.timedEffectUIs.clear()
        })
    }

    private updateScore(data: { score: number }) {
        this.currentScore = data.score
        this.scoreText.setText(`Score: ${data.score}`)
    }

    private updateLives(data: { lives: number }) {
        this.livesText.setText(`Lives: ${data.lives}`)
    }

    private updateBombs(data: { bombs: number }) {
        const maxBom = POWERUP_CONFIG.bombs.maxBombs
        const filledBom = '●'.repeat(Math.min(data.bombs, maxBom))
        const emptyBom = '○'.repeat(Math.max(0, maxBom - data.bombs))
        this.bombText.setText(`BOM: ${filledBom}${emptyBom}`)
    }

    private updateModifiers(modifiers: PermanentModifiers) {
        const maxDmg = POWERUP_CONFIG.permanent.maxDamageStacks
        const dmgStacks = modifiers.damageMultiplier > 1
            ? Math.round(Math.log(modifiers.damageMultiplier) / Math.log(POWERUP_CONFIG.permanent.damageMultiplier))
            : 0
        const filledDmg = '●'.repeat(dmgStacks)
        const emptyDmg = '○'.repeat(maxDmg - dmgStacks)
        this.damageText.setText(`DMG: ${filledDmg}${emptyDmg}`)

        const maxFr = POWERUP_CONFIG.permanent.maxFireRateStacks
        const frStacks = modifiers.fireRateBonuses
        const filledFr = '●'.repeat(Math.min(frStacks, maxFr))
        const emptyFr = '○'.repeat(Math.max(0, maxFr - frStacks))
        this.fireRateText.setText(`FR: ${filledFr}${emptyFr}`)

        const maxSpd = POWERUP_CONFIG.permanent.maxSpeedBonuses
        const spdStacks = modifiers.speedBonuses
        const filledSpd = '●'.repeat(Math.min(spdStacks, maxSpd))
        const emptySpd = '○'.repeat(Math.max(0, maxSpd - spdStacks))
        this.speedText.setText(`SPD: ${filledSpd}${emptySpd}`)
    }

    private handleWaveStarted(data: { currentWave: number }) {
        this.waveText.setText(`Wave ${data.currentWave}`)

        if (data.currentWave > 1) {
            this.tweens.add({
                targets: this.waveText,
                scale: { from: 1, to: 1.8 },
                duration: 200,
                ease: 'Back.easeOut',
                yoyo: true,
                hold: 100
            })
            let previousColor: string | null = null
            this.tweens.addCounter({
                from: 0,
                to: 100,
                duration: 500,
                onUpdate: (tween) => {
                    const value = tween.getValue() ?? 0
                    const newColor = value < 50 ? '#ffff00' : '#ffffff'
                    if (newColor !== previousColor) {
                        this.waveText.setStyle({ color: newColor })
                        previousColor = newColor
                    }
                }
            })
        }
    }

    private showTimedEffect(data: { type: PowerUpType; duration: number }) {
        if (!this.timedEffectsContainer) return

        const existingUI = this.timedEffectUIs.get(data.type)
        if (existingUI) {
            existingUI.tween.stop()
            existingUI.progressBar.setScale(1, 1)
            existingUI.tween = this.createProgressTween(existingUI.progressBar, data.duration)
            return
        }

        const container = this.add.container(0, 0)
        const label = this.add.text(0, -8, this.getPowerUpShortName(data.type), {
            fontFamily: 'KenVector Future',
            fontSize: '10px',
            color: this.getPowerUpColor(data.type)
        }).setOrigin(0.5)

        const { timedEffectBarWidth, timedEffectBarHeight, timedEffectBarBgColor } = UI_CONFIG.hud
        const progressBg = this.add.rectangle(0, 4, timedEffectBarWidth, timedEffectBarHeight, timedEffectBarBgColor)
        const progressBar = this.add.rectangle(0, 4, timedEffectBarWidth, timedEffectBarHeight, this.getPowerUpColorHex(data.type))
        progressBar.setOrigin(0.5)

        container.add([label, progressBg, progressBar])
        this.timedEffectsContainer.add(container)

        const tween = this.createProgressTween(progressBar, data.duration)

        this.timedEffectUIs.set(data.type, { container, progressBar, tween })
        this.repositionTimedEffects()
    }

    private createProgressTween(progressBar: Phaser.GameObjects.Rectangle, duration: number): Phaser.Tweens.Tween {
        return this.tweens.add({
            targets: progressBar,
            scaleX: 0,
            duration: duration,
            ease: 'Linear'
        })
    }

    private hideTimedEffect(data: { type: PowerUpType }) {
        const ui = this.timedEffectUIs.get(data.type)
        if (!ui) return

        ui.tween.stop()

        this.tweens.add({
            targets: ui.container,
            alpha: 0,
            scale: UI_CONFIG.hud.timedEffectCleanupScale,
            duration: UI_CONFIG.hud.timedEffectCleanupDuration,
            onComplete: () => {
                ui.container.destroy()
                this.timedEffectUIs.delete(data.type)
                this.repositionTimedEffects()
            }
        })
    }

    private repositionTimedEffects() {
        const spacing = UI_CONFIG.hud.timedEffectSpacing
        const effects = Array.from(this.timedEffectUIs.values())
        const startX = -((effects.length - 1) * spacing) / 2

        effects.forEach((ui, index) => {
            ui.container.x = startX + index * spacing
        })
    }

    private getPowerUpShortName(type: PowerUpType): string {
        const names: Record<PowerUpType, string> = {
            [PowerUpType.EXTRA_LIFE]: 'LIFE',
            [PowerUpType.FIRE_RATE_UP]: 'FIRE',
            [PowerUpType.DAMAGE_UP]: 'DMG',
            [PowerUpType.SPREAD_SHOT]: 'SPRD',
            [PowerUpType.SPEED_UP]: 'SPD',
            [PowerUpType.INVINCIBILITY]: 'INV',
            [PowerUpType.SHIELD]: 'SHLD',
            [PowerUpType.MAGNET]: 'MAG',
            [PowerUpType.SCORE_MULTIPLIER]: '2X',
            [PowerUpType.BOMB]: 'BOMB',
        }
        return names[type] || type
    }

    private getPowerUpColor(type: PowerUpType): string {
        const colors: Record<PowerUpType, string> = {
            [PowerUpType.EXTRA_LIFE]: '#ff6699',
            [PowerUpType.FIRE_RATE_UP]: '#ffaa00',
            [PowerUpType.DAMAGE_UP]: '#ff4444',
            [PowerUpType.SPREAD_SHOT]: '#00aaff',
            [PowerUpType.SPEED_UP]: '#88ffff',
            [PowerUpType.INVINCIBILITY]: '#ffff00',
            [PowerUpType.SHIELD]: '#00ffff',
            [PowerUpType.MAGNET]: '#ff00ff',
            [PowerUpType.SCORE_MULTIPLIER]: '#00ff00',
            [PowerUpType.BOMB]: '#ff6600',
        }
        return colors[type] || '#ffffff'
    }

    private getPowerUpColorHex(type: PowerUpType): number {
        const colors: Record<PowerUpType, number> = {
            [PowerUpType.EXTRA_LIFE]: 0xff6699,
            [PowerUpType.FIRE_RATE_UP]: 0xffaa00,
            [PowerUpType.DAMAGE_UP]: 0xff4444,
            [PowerUpType.SPREAD_SHOT]: 0x00aaff,
            [PowerUpType.SPEED_UP]: 0x88ffff,
            [PowerUpType.INVINCIBILITY]: 0xffff00,
            [PowerUpType.SHIELD]: 0x00ffff,
            [PowerUpType.MAGNET]: 0xff00ff,
            [PowerUpType.SCORE_MULTIPLIER]: 0x00ff00,
            [PowerUpType.BOMB]: 0xff6600,
        }
        return colors[type] || 0xffffff
    }

    private showGameOver() {
        const isNewHighScore = HighScoreManager.update(this.currentScore)
        const highScore = HighScoreManager.get()

        this.gameOverText = this.add.text(
            this.scale.width / 2,
            this.scale.height / 2 - UI_CONFIG.gameOver.textOffsetY,
            'GAME OVER',
            { fontFamily: 'KenVector Future', fontSize: '32px', color: '#ff0000' }
        ).setOrigin(0.5)

        if (isNewHighScore) {
            this.add.text(
                this.scale.width / 2,
                this.scale.height / 2 + UI_CONFIG.gameOver.highScoreOffsetY,
                'NEW HIGH SCORE!',
                { fontFamily: 'KenVector Future', fontSize: '18px', color: '#ffff00' }
            ).setOrigin(0.5)
        }

        this.add.text(
            this.scale.width / 2,
            this.scale.height / 2 + UI_CONFIG.gameOver.scoreOffsetY,
            `High Score: ${highScore}`,
            { fontFamily: 'KenVector Future', fontSize: '16px', color: '#ffffff' }
        ).setOrigin(0.5)

        this.add.text(
            this.scale.width / 2,
            this.scale.height / 2 + UI_CONFIG.gameOver.instructionsOffsetY,
            'R - Restart   M - Main Menu',
            { fontFamily: 'KenVector Future', fontSize: '14px', color: '#ffffff' }
        ).setOrigin(0.5)

        this.restartKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.R) ?? null
        this.restartKey?.once('down', this.restartGame, this)

        this.menuKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.M) ?? null
        this.menuKey?.once('down', this.goToMainMenu, this)
    }

    private restartGame() {
        this.scene.stop('UIScene')
        this.scene.stop('GameScene')
        this.scene.start('GameScene')
    }

    private showPaused() {
        this.tweens.pauseAll()
        this.pauseText = this.add.text(
            this.scale.width / 2,
            this.scale.height / 2 - UI_CONFIG.pause.textOffsetY,
            'PAUSED',
            { fontFamily: 'KenVector Future', fontSize: '32px', color: '#ffffff' }
        ).setOrigin(0.5)

        this.add.text(
            this.scale.width / 2,
            this.scale.height / 2 + UI_CONFIG.pause.hintOffsetY,
            'P - Resume   M - Main Menu   B - Bomb',
            { fontFamily: 'KenVector Future', fontSize: '14px', color: '#ffffff' }
        ).setOrigin(0.5).setName('pauseHint')

        if (GAME_CONFIG.debug) {
            this.debugKeysText = this.add.text(
                this.scale.width / 2,
                this.scale.height / 2 + UI_CONFIG.pause.debugKeysOffsetY,
                'DEBUG KEYS:\n' +
                '1-Life  2-Fire  3-Dmg  4-Spread  5-Speed\n' +
                '6-Invincible  7-Shield  8-Magnet\n' +
                '9-Score 2x  0-Bomb  B-Use Bomb',
                { fontFamily: 'KenVector Future', fontSize: '10px', color: '#888888', align: 'center' }
            ).setOrigin(0.5, 0)
        }

        this.menuKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.M) ?? null
        this.menuKey?.once('down', this.goToMainMenu, this)
    }

    private hidePaused() {
        this.tweens.resumeAll()
        this.pauseText?.destroy()
        this.pauseText = null
        this.children.getByName('pauseHint')?.destroy()
        this.debugKeysText?.destroy()
        this.debugKeysText = null
        this.menuKey?.off('down', this.goToMainMenu, this)
    }

    private goToMainMenu() {
        this.scene.stop('UIScene')
        this.scene.stop('GameScene')
        this.scene.start('MainMenuScene')
    }
}
