export const GAME_CONFIG = {
    width: 360,
    height: 640,
    backgroundColor: '#028af8',
}

export const PHYSICS_CONFIG = {
    gravity: { x: 0, y: 0 },
    debug: false,
}

export const PLAYER_CONFIG = {
    spawnOffsetFromBottom: 50,
    velocity: 200,
    body: { width: 28, height: 28, offsetX: -14, offsetY: -14 },
    shipSpriteOffsetY: -2,
}

export const ENEMY_CONFIG = {
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

export const WEAPON_CONFIG = {
    player: {
        cooldown: 800,
        spawnOffsetY: -20,
        velocityY: -400,
        cleanupThresholdY: 100,
        projectileBody: { width: 4, height: 12, offsetX: 0, offsetY: 4 },
    },
}

export const BACKGROUND_CONFIG = {
    scrollSpeed: 1,
}

export const GAME_STATE_CONFIG = {
    initialLives: 3,
    scorePerEnemy: 100,
    playerInvincibilityDuration: 1500,
}
