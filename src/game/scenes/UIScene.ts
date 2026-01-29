import { Scene } from "phaser"
import { GAME_CONFIG, GAME_STATE_CONFIG, POWERUP_CONFIG, UI_CONFIG } from "../config/GameConfig"
import { PowerUpType } from "../entities/powerups"
import { PermanentModifiers } from "../systems/PlayerPowerUpState"
import { HighScoreManager } from "../utils/HighScoreManager"
import { GameScene } from "./GameScene"

interface TimedEffectUI {
    container: Phaser.GameObjects.Container
    progressBar: Phaser.GameObjects.Rectangle
    tween: Phaser.Tweens.Tween
}

export class UIScene extends Scene {
    private scoreText: Phaser.GameObjects.Text
    private waveText: Phaser.GameObjects.Text
    private gameOverText: Phaser.GameObjects.Text | null = null
    private pauseText: Phaser.GameObjects.Text | null = null
    private debugKeysText: Phaser.GameObjects.Text | null = null
    private restartKey: Phaser.Input.Keyboard.Key | null = null
    private menuKey: Phaser.Input.Keyboard.Key | null = null
    private currentScore: number = 0
    private timedEffectsContainer: Phaser.GameObjects.Container | null = null
    private timedEffectUIs: Map<PowerUpType, TimedEffectUI> = new Map()
    private livesContainer: Phaser.GameObjects.Container
    private livesIcons: Phaser.GameObjects.Image[] = []
    private livesOverflowText: Phaser.GameObjects.Text | null = null
    private statContainers: Map<string, Phaser.GameObjects.Container> = new Map()
    private statSegments: Map<string, Phaser.GameObjects.Rectangle[]> = new Map()

    constructor() {
        super('UIScene')
    }

    create() {
        this.scene.bringToTop()

        const gameScene = this.scene.get('GameScene')

        const livesConfig = UI_CONFIG.hud.lives
        this.livesContainer = this.add.container(livesConfig.x, livesConfig.y)
        this.createLivesDisplay(GAME_STATE_CONFIG.initialLives)

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

        const statBarConfig = UI_CONFIG.hud.statBar
        const statEntries: Array<{ key: string; iconKey: string; maxSegments: number }> = [
            { key: 'bombs', iconKey: 'icon-bomb', maxSegments: statBarConfig.stats.bombs.maxSegments },
            { key: 'damage', iconKey: 'icon-damage', maxSegments: statBarConfig.stats.damage.maxSegments },
            { key: 'fireRate', iconKey: 'icon-firerate', maxSegments: statBarConfig.stats.fireRate.maxSegments },
            { key: 'speed', iconKey: 'icon-speed', maxSegments: statBarConfig.stats.speed.maxSegments },
        ]
        statEntries.forEach((entry, index) => {
            const y = statBarConfig.startY + index * statBarConfig.rowGap
            this.createStatBar(entry.key, entry.iconKey, statBarConfig.x, y, entry.maxSegments)
        })

        this.updateStatBar('bombs', POWERUP_CONFIG.bombs.initialBombs, statBarConfig.stats.bombs.color)
        this.updateStatBar('damage', 0, statBarConfig.stats.damage.color)
        this.updateStatBar('fireRate', 0, statBarConfig.stats.fireRate.color)
        this.updateStatBar('speed', 0, statBarConfig.stats.speed.color)

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
            this.livesIcons.forEach(icon => icon.destroy())
            this.livesIcons = []
            this.livesOverflowText?.destroy()
            this.livesContainer?.destroy()
            this.statContainers.forEach(container => container.destroy())
            this.statContainers.clear()
            this.statSegments.clear()
        })
    }

    private updateScore(data: { score: number }) {
        this.currentScore = data.score
        this.scoreText.setText(`Score: ${data.score}`)
    }

    private updateLives(data: { lives: number }) {
        this.createLivesDisplay(data.lives)
    }

    private updateBombs(data: { bombs: number }) {
        this.updateStatBar('bombs', data.bombs, UI_CONFIG.hud.statBar.stats.bombs.color)
    }

    private updateModifiers(modifiers: PermanentModifiers) {
        const stats = UI_CONFIG.hud.statBar.stats

        const dmgStacks = modifiers.damageMultiplier > 1
            ? Math.round(Math.log(modifiers.damageMultiplier) / Math.log(POWERUP_CONFIG.permanent.damageMultiplier))
            : 0
        this.updateStatBar('damage', dmgStacks, stats.damage.color)
        this.updateStatBar('fireRate', modifiers.fireRateBonuses, stats.fireRate.color)
        this.updateStatBar('speed', modifiers.speedBonuses, stats.speed.color)
    }

    private createLivesDisplay(lives: number): void {
        const config = UI_CONFIG.hud.lives

        this.livesIcons.forEach(icon => icon.destroy())
        this.livesIcons = []
        this.livesOverflowText?.destroy()
        this.livesOverflowText = null

        const displayCount = Math.min(lives, config.maxIconDisplay)
        const iconSpacing = config.iconSize + config.iconGap

        for (let i = 0; i < displayCount; i++) {
            const icon = this.add.image(i * iconSpacing, 0, 'icon-life')
            icon.setDisplaySize(config.iconSize, config.iconSize)
            icon.setOrigin(0, 0)
            this.livesContainer.add(icon)
            this.livesIcons.push(icon)
        }

        if (lives > config.maxIconDisplay) {
            const overflowX = displayCount * iconSpacing + config.overflowTextGap
            this.livesOverflowText = this.add.text(overflowX, 0, `×${lives - config.maxIconDisplay + 1}`, {
                fontFamily: 'KenVector Future',
                fontSize: '14px',
                color: '#ffffff'
            })
            this.livesContainer.add(this.livesOverflowText)
        }
    }

    private createStatBar(key: string, iconKey: string, x: number, y: number, maxSegments: number): void {
        const config = UI_CONFIG.hud.statBar
        const container = this.add.container(x, y)

        const icon = this.add.image(0, 0, iconKey)
        icon.setDisplaySize(config.iconSize, config.iconSize)
        icon.setOrigin(0, 0.5)
        container.add(icon)

        const segments: Phaser.GameObjects.Rectangle[] = []
        const barStartX = config.iconSize + config.iconToBarGap

        for (let i = 0; i < maxSegments; i++) {
            const segmentX = barStartX + i * (config.segmentWidth + config.segmentGap)
            const segment = this.add.rectangle(segmentX, 0, config.segmentWidth, config.barHeight, config.emptyColor)
            segment.setOrigin(0, 0.5)
            container.add(segment)
            segments.push(segment)
        }

        this.statContainers.set(key, container)
        this.statSegments.set(key, segments)
    }

    private updateStatBar(key: string, filledCount: number, fillColor: number): void {
        const segments = this.statSegments.get(key)
        if (!segments) return

        const emptyColor = UI_CONFIG.hud.statBar.emptyColor
        segments.forEach((segment, index) => {
            segment.setFillStyle(index < filledCount ? fillColor : emptyColor)
        })
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

        const restartButton = this.add.text(
            this.scale.width / 2,
            this.scale.height / 2 + UI_CONFIG.gameOver.instructionsOffsetY,
            'RESTART',
            { fontSize: '18px', color: '#ffffff', backgroundColor: '#333333', padding: { x: 15, y: 8 } }
        ).setOrigin(0.5).setInteractive({ useHandCursor: true })

        restartButton.on('pointerover', () => restartButton.setStyle({ backgroundColor: '#555555' }))
        restartButton.on('pointerout', () => restartButton.setStyle({ backgroundColor: '#333333' }))
        restartButton.on('pointerdown', () => this.restartGame())

        const menuButton = this.add.text(
            this.scale.width / 2,
            this.scale.height / 2 + UI_CONFIG.gameOver.instructionsOffsetY + 40,
            'MAIN MENU',
            { fontSize: '18px', color: '#ffffff', backgroundColor: '#333333', padding: { x: 15, y: 8 } }
        ).setOrigin(0.5).setInteractive({ useHandCursor: true })

        menuButton.on('pointerover', () => menuButton.setStyle({ backgroundColor: '#555555' }))
        menuButton.on('pointerout', () => menuButton.setStyle({ backgroundColor: '#333333' }))
        menuButton.on('pointerdown', () => this.goToMainMenu())

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

        const resumeButton = this.add.text(
            this.scale.width / 2,
            this.scale.height / 2 + UI_CONFIG.pause.hintOffsetY,
            'RESUME',
            { fontSize: '18px', color: '#ffffff', backgroundColor: '#333333', padding: { x: 15, y: 8 } }
        ).setOrigin(0.5).setInteractive({ useHandCursor: true }).setName('resumeButton')

        resumeButton.on('pointerover', () => resumeButton.setStyle({ backgroundColor: '#555555' }))
        resumeButton.on('pointerout', () => resumeButton.setStyle({ backgroundColor: '#333333' }))
        resumeButton.on('pointerdown', () => {
            const gameScene = this.scene.get('GameScene') as GameScene
            gameScene.togglePause()
        })

        const pauseMenuButton = this.add.text(
            this.scale.width / 2,
            this.scale.height / 2 + UI_CONFIG.pause.hintOffsetY + 40,
            'MAIN MENU',
            { fontSize: '18px', color: '#ffffff', backgroundColor: '#333333', padding: { x: 15, y: 8 } }
        ).setOrigin(0.5).setInteractive({ useHandCursor: true }).setName('pauseMenuButton')

        pauseMenuButton.on('pointerover', () => pauseMenuButton.setStyle({ backgroundColor: '#555555' }))
        pauseMenuButton.on('pointerout', () => pauseMenuButton.setStyle({ backgroundColor: '#333333' }))
        pauseMenuButton.on('pointerdown', () => this.goToMainMenu())

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
        this.children.getByName('resumeButton')?.destroy()
        this.children.getByName('pauseMenuButton')?.destroy()
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
