export const GAME_CONFIG = {
    width: 360,
    height: 640,
    backgroundColor: '#000000',
    debug: true,
}

export const BOOT_CONFIG = {
    loadingBar: {
        width: 200,
        height: 10,
        offsetFromBottom: 60,
        backgroundColor: 0x333333,
        fillColor: 0xffffff,
    },
}

export const PHYSICS_CONFIG = {
    gravity: { x: 0, y: 0 },
    debug: false,
}

export const PLAYER_CONFIG = {
    spawnOffsetFromBottom: 100,
    velocity: 200,
    body: { width: 28, height: 28, offsetX: -14, offsetY: -14 },
    shipSpriteOffsetY: -2,
}

export const ENEMY_CONFIG = {
    initialY: -150,
    klaedScout: {
        body: { width: 24, height: 26, offsetX: -12, offsetY: -18 },
    },
    spawner: {
        rate: 2000,
        spawnPaddingX: 20,
        spawnY: -50,
        velocityY: 100,
        cleanupOffsetY: 100,
    },
}

export const ENEMY_HEALTH_CONFIG = {
    klaedScout: {
        baseHealth: 2,
    },
    scaling: {
        healthPerWave: 1,
    },
    hitFlash: {
        tintColor: 0xff4444,
        duration: 200,
        flashAlpha: 0.4,
        scaleBounce: 0.15,
    },
}

export const WEAPON_CONFIG = {
    player: {
        baseDamage: 1,
        cooldown: 800,
        spawnOffsetY: -20,
        velocityY: -400,
        cleanupThresholdY: 100,
        projectileBody: { width: 4, height: 12, offsetX: 0, offsetY: 4 },
    },
    enemy: {
        cooldownMin: 2000,
        cooldownMax: 4000,
        initialCooldownMin: 200,
        initialCooldownMax: 800,
        spawnOffsetY: 20,
        velocityY: 210,
        projectileBody: { width: 4, height: 12, offsetX: 0, offsetY: 0 },
        firstShootingWave: 3,
        cleanupOffsetY: 50,
        uniqueIdRange: 1000000,
    },
}

export const BACKGROUND_CONFIG = {
    baseScrollSpeed: 0.8,
    maxScrollSpeed: 2,
    scrollSpeedIncreasePerWave: 0.15,
}

export const GAME_STATE_CONFIG = {
    initialLives: 3,
    maxLives: 9,
    scorePerEnemy: 100,
    playerInvincibilityDuration: 1500,
}

export const POWERUP_CONFIG = {
    spawner: {
        dropChanceOnEnemyDeath: 0.15,
        randomSpawnInterval: 15000,
        spawnY: -30,
        velocityY: 80,
        cleanupOffsetY: 50,
        magnetRadius: 120,
        magnetSpeed: 250,
        spawnPaddingX: 30,
    },

    body: {
        width: 24,
        height: 24,
        offsetX: -12,
        offsetY: -12,
    },

    durations: {
        invincibility: 5000,
        shield: 10000,
        magnet: 15000,
        scoreMultiplier: 15000,
    },

    permanent: {
        fireRateReduction: 200,
        fireRateMinCooldown: 200,
        maxFireRateStacks: 3,
        damageMultiplier: 1.5,
        maxDamageStacks: 3,
        spreadShotAngles: [-8, 0, 8],
        speedBonus: 50,
        maxSpeedBonuses: 3,
    },

    bombs: {
        maxBombs: 3,
        initialBombs: 1,
    },

    scoreMultiplierValue: 2,

    types: {
        extraLife: { weight: 5, assetKey: 'powerup-extra-life' },
        fireRateUp: { weight: 15, assetKey: 'powerup-fire-rate' },
        damageUp: { weight: 15, assetKey: 'powerup-damage' },
        spreadShot: { weight: 10, assetKey: 'powerup-spread' },
        speedUp: { weight: 12, assetKey: 'powerup-speed' },
        invincibility: { weight: 8, assetKey: 'powerup-invincibility' },
        shield: { weight: 12, assetKey: 'powerup-shield' },
        magnet: { weight: 10, assetKey: 'powerup-magnet' },
        scoreMultiplier: { weight: 15, assetKey: 'powerup-score' },
        bomb: { weight: 8, assetKey: 'powerup-bomb' },
    },
}

export const WAVE_CONFIG = {
    baseScoreToComplete: 500,
    scoreScalingPerWave: 300,

    spawner: {
        baseRate: 2000,
        minRate: 500,
        rateReductionPerWave: 250,
        spawnPaddingX: 20,
        spawnY: -50,
        cleanupOffsetY: 100,
    },

    enemy: {
        baseVelocityY: 100,
        maxVelocityY: 176,
        velocityIncreasePerWave: 8,
    },

    formations: {
        spacingX: 30,
        spacingY: 26,
        firstFormationWave: 6,
        patterns: [
            { cols: 1, rows: 1, weight: 5 },
            { cols: 2, rows: 1, weight: 3 },
            { cols: 3, rows: 1, weight: 2 },
        ],
    },
}

export const UI_CONFIG = {
    hud: {
        timedEffectsContainerOffsetY: 40,
        timedEffectBarWidth: 40,
        timedEffectBarHeight: 6,
        timedEffectBarBgColor: 0x333333,
        timedEffectSpacing: 50,
        timedEffectCleanupDuration: 200,
        timedEffectCleanupScale: 0.5,
        timedEffectLabelOffsetY: -8,
        timedEffectProgressOffsetY: 4,
        lives: {
            x: 15,
            y: 20,
            iconSize: 16,
            iconGap: 2,
            maxIconDisplay: 5,
            overflowTextGap: 4,
        },
        statBar: {
            x: 15,
            startY: 50,
            rowGap: 24,
            iconSize: 16,
            iconToBarGap: 4,
            segmentWidth: 4,
            segmentGap: 2,
            barHeight: 16,
            emptyColor: 0x333333,
            stats: {
                bombs: { maxSegments: 3, color: 0xff6600 },
                damage: { maxSegments: 3, color: 0xff4444 },
                fireRate: { maxSegments: 3, color: 0xffaa00 },
                speed: { maxSegments: 3, color: 0x88ffff },
            },
        },
    },
    announcements: {
        waveOffsetY: 50,
        waveScaleFrom: 0.5,
        waveScaleTo: 1.2,
        waveAnimDuration: 300,
        waveHoldDuration: 500,
        powerUpBaseOffsetY: 60,
        powerUpStackSpacing: 30,
        powerUpAnimOffsetY: 40,
        powerUpAnimDuration: 300,
        powerUpHoldDuration: 300,
        shieldBlockedOffsetY: 30,
        shieldBlockedScaleTo: 1.3,
        shieldBlockedDuration: 200,
        shieldBlockedHoldDuration: 200,
    },
    gameOver: {
        textOffsetY: 30,
        highScoreOffsetY: 10,
        scoreOffsetY: 40,
        instructionsOffsetY: 80,
    },
    pause: {
        textOffsetY: 20,
        hintOffsetY: 30,
        debugKeysOffsetY: 70,
    },
}

export const MENU_CONFIG = {
    titleLogoYFraction: 1 / 3,
    startButtonOffsetY: 50,
    clearButtonOffsetY: 100,
    instructionsOffsetFromBottom: 50,
}

export const ANIMATION_CONFIG = {
    playerInvincibility: {
        flashAlpha: 0.3,
        flashDuration: 100,
        flashRepeatDivisor: 200,
    },
    waveAnnouncement: {
        scaleFrom: 1,
        scaleTo: 1.8,
        scaleDuration: 200,
        scaleHold: 100,
        counterDuration: 500,
        counterColorThreshold: 50,
        colorBelowThreshold: '#ffff00',
        colorAboveThreshold: '#ffffff',
    },
}

export const TOUCH_CONTROLS_CONFIG = {
    doubleTapThreshold: 300,
    buttons: {
        pause: { x: 330, y: 70, radius: 20 },
        left: { x: 50, y: 595, radius: 40 },
        right: { x: 310, y: 595, radius: 40 },
    },
    style: {
        fillColor: 0x333333,
        fillAlpha: 0.6,
        strokeColor: 0xffffff,
        strokeAlpha: 0,
        strokeWidth: 2,
    },
    bounds: {
        paddingX: 20,
        minY: 100,
        maxYOffset: 50,
    },
    buttonLabels: {
        fontSizeThreshold: 25,
        largeFontSize: '14px',
        smallFontSize: '10px',
    },
}
