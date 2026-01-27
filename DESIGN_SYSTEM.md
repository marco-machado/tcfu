# TCFU Design System

This document defines the visual design language, art style, and UI/UX specifications for **They Came From Uranus (TCFU)**.

---

## Overview

TCFU is a **retro arcade pixel art vertical space shooter** inspired by classic 1980s-90s arcade games like Galaga, 1942, and Phoenix.

### Core Design Principles

- **Clarity over complexity**: Clear silhouettes and high contrast for instant recognition during fast gameplay
- **Retro authenticity**: Pixel-perfect rendering, limited color palettes, simple frame animations
- **Visual hierarchy**: Distinct layers for background, gameplay, and UI
- **Player/enemy differentiation**: Warm colors (red/orange) for player, cool colors (cyan/blue) for enemies

---

## Canvas & Display

| Property | Value |
|----------|-------|
| Dimensions | 360 x 640 pixels (portrait) |
| Pixel Art Mode | Enabled |
| Round Pixels | Enabled |
| Scale Mode | `Scale.FIT` |
| Auto Center | `Scale.CENTER_BOTH` |
| Background | `#028af8` |

---

## Color Palette

### Core Colors

| Name | Hex | Usage |
|------|-----|-------|
| Cosmic Blue | `#028af8` | Canvas background |
| White | `#ffffff` | Primary text, player ship base |
| Yellow | `#ffff00` | Highlights, high score, wave announcements |
| Red | `#ff0000` | Game over text, player projectiles |
| Light Red | `#ff6666` | Secondary/danger buttons |
| Gray | `#888888` | Hint text, disabled states |
| Dark Gray | `#333333` | Button backgrounds (default), bar backgrounds |
| Dark Gray Hover | `#555555` | Button backgrounds (hover) |

### Entity Color Coding

| Entity | Base Color | Engine/Effects |
|--------|------------|----------------|
| Player | White / Light Gray | Red / Orange |
| Enemies | Dark Red / Burgundy | Cyan / Blue |

This warm vs. cool color separation creates instant visual distinction between player and enemy elements.

### Powerup Effect Colors

| Effect | Color | Hex |
|--------|-------|-----|
| Invincibility | Yellow | `#ffff00` |
| Shield | Cyan | `#00ffff` |
| Magnet | Magenta | `#ff00ff` |
| Score Multiplier | Green | `#00ff00` |
| Fire Rate | Orange | `#ffaa00` |
| Damage | Red | `#ff4444` |
| Spread Shot | Blue | `#00aaff` |
| Speed | Cyan | `#88ffff` |
| Extra Life | Pink | `#ff6699` |
| Bomb | Orange-Red | `#ff6600` |

---

## Typography

| Size | Weight | Usage | Color |
|------|--------|-------|-------|
| 48px | Bold | Large announcements (wave number) | Yellow |
| 32px | Normal | Titles ("GAME OVER", menu) | White/Red |
| 24px | Normal | Primary buttons, shield blocked | White/Cyan |
| 20px | Normal | Powerup announcements | Yellow (varies) |
| 16px | Normal | HUD data (lives, score, wave) | White |
| 14px | Normal | Control hints, instructions | White |
| 12px | Normal | Footer, secondary hints, debug text | Gray |

**Font**: System default (no custom fonts loaded)

---

## UI Components

See [UI_COMPONENTS.md](./UI_COMPONENTS.md) for detailed UI component specifications.

### UI Layout Zones

```
+-------------------------------------------+
| HUD Row 1: Lives | Wave | Score           |  <- 20px from top
| HUD Row 2: BOM | DMG | FR | SPD           |  <- 40px from top
|                                           |
|           [GAMEPLAY AREA]                 |
|                                           |
|        [CENTER ANNOUNCEMENTS]             |  <- Center screen
|                                           |
|     [TIMED EFFECTS PROGRESS BARS]         |  <- Bottom area
+-------------------------------------------+
```

---

## Art Style Guidelines

### Pixel Art Principles

1. **Minimalist design**: Small sprite dimensions, essential details only
2. **Clear silhouettes**: Shapes readable at a glance during fast gameplay
3. **Limited palettes**: 2-4 colors per sprite maximum
4. **No anti-aliasing**: Preserve hard pixel edges for authentic retro look
5. **Consistent scale**: Similar-sized entities for visual cohesion

### Sprite Dimensions

| Asset | Dimensions | Notes |
|-------|------------|-------|
| Player ship | ~32 x 32px | White/light base color |
| Player engine effects | 48 x 48px | Spritesheet |
| Enemy ship (Klaed Scout) | ~32 x 32px | Dark red base |
| Enemy engine | 64 x 64px | Spritesheet, cyan glow |
| Player projectile | 4 x 12px | Thin vertical, red |
| Enemy projectile | 4 x 16px | Spritesheet, orange/yellow |
| Powerup sprites | 24 x 24px | Bright colors, 1px outline |
| Background | 2368 x 1792px | Deep space starfield, tiles vertically |

### Collision Bodies

Bodies are smaller than visual sprites for forgiving gameplay:

| Entity | Body Size | Offset |
|--------|-----------|--------|
| Player | 28 x 28px | (-14, -14) |
| Klaed Scout | 24 x 26px | (-12, -18) |
| Player bullet | 4 x 12px | - |

---

## Animation Specs

### Standard Settings

- **Frame rate**: 12 fps
- **Loop**: Infinite (`repeat: -1`)

### Defined Animations

| Key | Frames | Asset Key | Purpose |
|-----|--------|-----------|---------|
| `player-base-engine-idle` | [0, 1, 2] | player-base-engine-effects | Idle engine glow |
| `player-base-engine-powering` | [4, 5, 6, 7] | player-base-engine-effects | Acceleration effect |
| `klaed-scout-engine-powering` | all | klaed-scout-engine | Enemy engine cyan glow |
| `klaed-scout-bullet-flying` | all | klaed-scout-bullet | Projectile trail |

### UI Animation Patterns

**Wave Announcement:**
```typescript
this.tweens.add({
    targets: element,
    alpha: { from: 0, to: 1 },
    scale: { from: 0.5, to: 1.2 },
    duration: 300,
    ease: 'Power2',
    yoyo: true,
    hold: 500
})
```

**Shield Absorbed:**
```typescript
this.tweens.add({
    targets: element,
    scale: { from: 1.0, to: 1.3 },
    duration: 200,
    ease: 'Power2'
})
```

**Timed Effect Progress Bar:**
- Smooth width tween from full to zero over effect duration
- Pauses when game paused, resumes with remaining duration

---

## Asset Pipeline

### Naming Convention

Use **kebab-case** for all asset keys:
- `player-ship`
- `klaed-scout-engine`
- `player-bullet`
- `powerup-fire-rate`
- `powerup-shield`

### File Locations

```
public/assets/
+-- images/           # All sprite and background images
|   +-- powerups/     # Powerup sprites
+-- data/
    +-- assets.json   # Asset registry (images, spritesheets)
    +-- animations.json  # Animation definitions
```

### Adding New Assets

**1. Static Image:**

Add to `assets.json`:
```json
{
  "type": "image",
  "key": "new-asset-key",
  "url": "images/new-asset.png"
}
```

**2. Spritesheet:**

Add to `assets.json`:
```json
{
  "type": "spritesheet",
  "key": "new-spritesheet-key",
  "url": "images/new-spritesheet.png",
  "frameConfig": {
    "frameWidth": 48,
    "frameHeight": 48
  }
}
```

**3. Animation:**

Add to `animations.json`:
```json
{
  "key": "new-animation-key",
  "type": "frame",
  "frames": [
    { "key": "new-spritesheet-key", "frame": 0 },
    { "key": "new-spritesheet-key", "frame": 1 },
    { "key": "new-spritesheet-key", "frame": 2 }
  ],
  "frameRate": 12,
  "repeat": -1
}
```

---

## Visual Hierarchy (Z-Order)

From back to front:

1. **Background** - Scrolling starfield
2. **PowerUps** - Collectible items
3. **Enemies** - Enemy ships and projectiles
4. **Player** - Player ship and projectiles
5. **HUD** - Lives, wave, score, powerup indicators (UIScene overlay)
6. **Timed Effects** - Progress bars for active effects
7. **Announcements** - Wave start, powerup collected, pause, game over modals

---

## Reference: Game Constants

Key visual parameters from `GameConfig.ts`:

| Constant | Value | Context |
|----------|-------|---------|
| `GAME_WIDTH` | 360 | Canvas width |
| `GAME_HEIGHT` | 640 | Canvas height |
| `PLAYER_CONFIG.velocity` | 200 | Player movement speed |
| `ENEMY_CONFIG.velocityY` | 100 | Base enemy descent speed |
| `WEAPON_CONFIG.cooldown` | 800 | Base milliseconds between shots |
| `WAVE_CONFIG.baseSpawnRate` | 2000 | Initial spawn interval (ms) |
| `POWERUP_CONFIG.dropChance` | 0.15 | 15% enemy death drop chance |
| `POWERUP_CONFIG.randomInterval` | 15000 | Random spawn interval (ms) |
| `POWERUP_CONFIG.durations.invincibility` | 10000 | Invincibility duration (ms) |
| `POWERUP_CONFIG.durations.shield` | 15000 | Shield duration (ms) |
| `POWERUP_CONFIG.durations.magnet` | 15000 | Magnet duration (ms) |
| `POWERUP_CONFIG.durations.scoreMultiplier` | 15000 | 2x score duration (ms) |
