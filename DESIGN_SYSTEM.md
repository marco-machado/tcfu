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
| Dimensions | 360 × 640 pixels (portrait) |
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
| Dark Gray | `#333333` | Button backgrounds (default) |
| Dark Gray Hover | `#555555` | Button backgrounds (hover) |

### Entity Color Coding

| Entity | Base Color | Engine/Effects |
|--------|------------|----------------|
| Player | White / Light Gray | Red / Orange |
| Enemies | Dark Red / Burgundy | Cyan / Blue |

This warm vs. cool color separation creates instant visual distinction between player and enemy elements.

---

## Typography

| Size | Weight | Usage | Color |
|------|--------|-------|-------|
| 48px | Bold | Large announcements (wave number) | Yellow |
| 32px | Normal | Titles ("GAME OVER", menu) | White/Red |
| 24px | Normal | Primary buttons | White |
| 16px | Normal | HUD data (lives, score, wave) | White |
| 14px | Normal | Control hints, instructions | White |
| 12px | Normal | Footer, secondary hints | Gray |

**Font**: System default (no custom fonts loaded)

---

## UI Components

See [UI_COMPONENTS.md](./UI_COMPONENTS.md) for detailed UI component specifications.

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
| Player ship | ~32 × 32px | White/light base color |
| Player engine effects | 48 × 48px | Spritesheet |
| Enemy ship (Klaed Scout) | ~32 × 32px | Dark red base |
| Enemy engine | 64 × 64px | Spritesheet, cyan glow |
| Player projectile | 4 × 12px | Thin vertical, red |
| Enemy projectile | 4 × 16px | Spritesheet, orange/yellow |
| Background | 2368 × 1792px | Deep space starfield, tiles vertically |

### Collision Bodies

Bodies are smaller than visual sprites for forgiving gameplay:

| Entity | Body Size | Offset |
|--------|-----------|--------|
| Player | 28 × 28px | (-14, -14) |
| Klaed Scout | 24 × 26px | (-12, -18) |
| Player bullet | 4 × 12px | — |

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

Use Phaser tweens for UI feedback:

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

---

## Asset Pipeline

### Naming Convention

Use **kebab-case** for all asset keys:
- `player-ship`
- `klaed-scout-engine`
- `player-bullet`

### File Locations

```
public/assets/
├── images/           # All sprite and background images
└── data/
    ├── assets.json   # Asset registry (images, spritesheets)
    └── animations.json  # Animation definitions
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

1. **Background** — Scrolling starfield
2. **Enemies** — Enemy ships and projectiles
3. **Player** — Player ship and projectiles
4. **HUD** — Lives, wave, score (UIScene overlay)
5. **Announcements** — Wave start, pause, game over modals

---

## Reference: Game Constants

Key visual parameters from `GameConfig.ts`:

| Constant | Value | Context |
|----------|-------|---------|
| `GAME_WIDTH` | 360 | Canvas width |
| `GAME_HEIGHT` | 640 | Canvas height |
| `PLAYER_CONFIG.velocity` | 200 | Player movement speed |
| `ENEMY_CONFIG.velocityY` | 100 | Base enemy descent speed |
| `WEAPON_CONFIG.fireRate` | 800 | Milliseconds between shots |
| `WAVE_CONFIG.baseSpawnRate` | 2000 | Initial spawn interval (ms) |
