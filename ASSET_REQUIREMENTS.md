# TCFU Asset Requirements

This document lists visual and audio assets needed to improve TCFU's UI and gameplay, based on the design system specifications.

---

## Current State Summary

**Existing Assets:**
- Player sprites (ship, engine, engine effects animation)
- Enemy sprites (Klaed Scout ship, engine animation, bullet animation)
- Player bullet sprite
- Scrolling space background
- Title logo
- Powerup sprites (10 types - placeholder sprites implemented)

**Current UI Implementation:**
- Text-based HUD with lives, score, wave display
- Powerup status indicators (BOM, DMG, FR, SPD with filled/empty circles)
- Timed effect progress bars (animated, color-coded)
- Buttons are styled text boxes with background colors
- Wave announcements with scale animation
- Powerup collection announcements (stacked, color-coded)
- Shield absorbed feedback
- Loading screen with progress bar
- No visual icons or panels (text-based indicators)

---

## Required Assets

### 1. UI Graphics

#### 1.1 Logo / Title
| Asset | Dimensions | Description | Prompt |
|-------|------------|-------------|--------|
| `title-logo.png` | ~280 × 80px | "THEY CAME FROM URANUS" pixel art logo, white with optional accent color | Pixel art game logo "THEY CAME FROM URANUS", retro 1980s arcade style, horizontal banner format 280x80 pixels, white blocky pixel letters with yellow glow accents, hard pixel edges, no anti-aliasing, 8-bit aesthetic, classic space shooter typography like Galaga or Space Invaders, small pixel UFO or alien silhouette integrated into design, transparent background, 2-4 color maximum palette (white, yellow, optional red accent), crisp readable text, authentic retro arcade cabinet title screen feel |

#### 1.2 Buttons
| Asset | Dimensions | Description |
|-------|------------|-------------|
| `button-large.png` | ~120 × 40px | 9-slice panel for START, PLAY buttons |
| `button-large-hover.png` | ~120 × 40px | Hover state variant |
| `button-small.png` | ~80 × 28px | 9-slice panel for secondary buttons |
| `button-small-hover.png` | ~80 × 28px | Hover state variant |

#### 1.3 HUD Elements
| Asset | Dimensions | Description |
|-------|------------|-------------|
| `hud-panel.png` | ~360 × 32px | Optional top bar background for HUD |
| `icon-life.png` | 16 × 16px | Small player ship silhouette for lives display |
| `icon-life-empty.png` | 16 × 16px | Grayed-out ship for lost lives (optional) |

#### 1.4 Overlay Panels
| Asset | Dimensions | Description |
|-------|------------|-------------|
| `panel-overlay.png` | ~280 × 200px | Semi-transparent 9-slice panel for pause/game over screens |

---

### 2. Gameplay Graphics

#### 2.1 Visual Effects
| Asset | Dimensions | Description |
|-------|------------|-------------|
| `explosion-enemy.png` | 32 × 32px (spritesheet) | 4-6 frame enemy destruction animation |
| `explosion-player.png` | 48 × 48px (spritesheet) | 4-6 frame player hit/death animation |
| `hit-spark.png` | 16 × 16px (spritesheet) | 2-3 frame bullet impact effect |

#### 2.2 Player Feedback
| Asset | Dimensions | Description |
|-------|------------|-------------|
| `shield-effect.png` | 48 × 48px (spritesheet) | Invincibility visual indicator (flashing overlay or shield bubble) |

#### 2.3 Power-Up Sprites

All power-up sprites go in `public/assets/images/powerups/`.

| Asset | Dimensions | Description | Color Palette |
|-------|------------|-------------|---------------|
| `extra_life.png` | 24 × 24px | Heart or +1 icon | Pink (#ff6699) |
| `fire_rate.png` | 24 × 24px | Rapid fire symbol (bullets/lightning bolt) | Orange (#ffaa00) |
| `damage.png` | 24 × 24px | Damage boost (fist/explosion/sword) | Red (#ff4444) |
| `spread_shot.png` | 24 × 24px | Triple arrow or fan pattern | Blue (#00aaff) |
| `speed_up.png` | 24 × 24px | Speed boost (arrow/lightning/wing) | Cyan (#88ffff) |
| `invincibility.png` | 24 × 24px | Star or shield burst | Yellow (#ffff00) |
| `shield.png` | 24 × 24px | Round shield/bubble | Cyan (#00ffff) |
| `magnet.png` | 24 × 24px | Magnet shape (U-shape) | Magenta (#ff00ff) |
| `score_multiplier.png` | 24 × 24px | 2X text or coin symbol | Green (#00ff00) |
| `bomb.png` | 24 × 24px | Bomb or explosion icon | Orange-red (#ff6600) |

**Power-Up Sprite Guidelines:**
- Use bright, distinct colors for easy identification during gameplay
- Add 1px dark outline for visibility against space background
- Optional: 4-frame horizontal strip (96×24px) for idle glow/pulse animation at 8 FPS
- Icons should be recognizable at a glance
- Current placeholder sprites exist; replace with final pixel art when ready

---

### 3. Audio (SFX)

#### 3.1 Player Actions
| Asset | Format | Description |
|-------|--------|-------------|
| `sfx-player-shoot.wav` | WAV/OGG | Player weapon fire sound |
| `sfx-player-hit.wav` | WAV/OGG | Player takes damage |
| `sfx-player-death.wav` | WAV/OGG | Player loses all lives |

#### 3.2 Enemy Actions
| Asset | Format | Description |
|-------|--------|-------------|
| `sfx-enemy-shoot.wav` | WAV/OGG | Enemy weapon fire sound |
| `sfx-enemy-explode.wav` | WAV/OGG | Enemy destruction |

#### 3.3 UI Feedback
| Asset | Format | Description |
|-------|--------|-------------|
| `sfx-button-hover.wav` | WAV/OGG | Menu button hover |
| `sfx-button-click.wav` | WAV/OGG | Menu button confirm |
| `sfx-wave-start.wav` | WAV/OGG | New wave announcement |
| `sfx-game-over.wav` | WAV/OGG | Game over sting |

#### 3.4 Power-Up Sounds
| Asset | Format | Description |
|-------|--------|-------------|
| `sfx-powerup-collect.wav` | WAV/OGG | Generic power-up pickup sound |
| `sfx-powerup-shield.wav` | WAV/OGG | Shield activation |
| `sfx-powerup-shield-hit.wav` | WAV/OGG | Shield absorbs damage |
| `sfx-powerup-bomb.wav` | WAV/OGG | Screen clear explosion |
| `sfx-powerup-expire.wav` | WAV/OGG | Timed power-up ending warning |

#### 3.5 Music
| Asset | Format | Description |
|-------|--------|-------------|
| `music-menu.ogg` | OGG | Main menu loop (retro synth style) |
| `music-gameplay.ogg` | OGG | In-game music loop |

---

## Asset Specifications

### Color Guidelines (from Design System)
- **Player elements**: White/light gray base, red/orange accents
- **Enemy elements**: Dark red/burgundy base, cyan/blue accents
- **UI text/icons**: White primary, yellow highlights, gray hints
- **Buttons**: #333333 default, #555555 hover

### Pixel Art Style
- No anti-aliasing (hard pixel edges)
- 2-4 colors per sprite maximum
- Clear silhouettes readable during fast gameplay
- Consistent with existing 32×32px entity scale

### Audio Style
- 8-bit / chiptune aesthetic
- Short, punchy sound effects (50-200ms)
- Music: 80s arcade synth feel, loopable

---

## Asset Creation Workflow

Recommended process for creating assets with AI assistance:

1. **Generate prompt** — Use DESIGN_SYSTEM.md specs to craft an AI image generation prompt (dimensions, colors, style constraints)
2. **AI generation** — Run prompt through AI image generator (GPT Image 1.5 recommended for transparent PNG support)
3. **Review** — Claude analyzes the output for design system compliance (colors, pixel style, readability)
4. **Refine in GIMP** — Fix issues identified during review (pixel cleanup, readability, color correction)
5. **Save to directory** — Place file in correct location per File Organization section
6. **Integrate** — Add entry to `assets.json`, update code to use the new asset

---

## Priority Tiers

### Tier 1 - Essential
- `sfx-player-shoot.wav`
- `sfx-enemy-explode.wav`
- `explosion-enemy.png`
- `icon-life.png`

### Tier 2 - High Value
- `title-logo.png`
- `sfx-player-hit.wav`
- `sfx-wave-start.wav`
- `shield-effect.png`
- `music-gameplay.ogg`
- Power-up sprites (all 10) — placeholder sprites exist, replace with pixel art
- `sfx-powerup-collect.wav`

### Tier 3 - Polish
- Button graphics (all)
- Panel graphics (all)
- `music-menu.ogg`
- Remaining SFX
- `explosion-player.png`
- `hit-spark.png`

---

## File Organization

```
public/assets/
├── images/
│   ├── ui/
│   │   ├── title-logo.png
│   │   ├── button-large.png
│   │   ├── button-large-hover.png
│   │   ├── button-small.png
│   │   ├── button-small-hover.png
│   │   ├── hud-panel.png
│   │   ├── icon-life.png
│   │   ├── icon-life-empty.png
│   │   └── panel-overlay.png
│   ├── powerups/
│   │   ├── extra_life.png
│   │   ├── fire_rate.png
│   │   ├── damage.png
│   │   ├── spread_shot.png
│   │   ├── speed_up.png
│   │   ├── invincibility.png
│   │   ├── shield.png
│   │   ├── magnet.png
│   │   ├── score_multiplier.png
│   │   └── bomb.png
│   └── effects/
│       ├── explosion-enemy.png
│       ├── explosion-player.png
│       ├── hit-spark.png
│       └── shield-effect.png
├── audio/
│   ├── sfx/
│   │   ├── sfx-player-shoot.wav
│   │   ├── sfx-player-hit.wav
│   │   ├── sfx-player-death.wav
│   │   ├── sfx-enemy-shoot.wav
│   │   ├── sfx-enemy-explode.wav
│   │   ├── sfx-button-hover.wav
│   │   ├── sfx-button-click.wav
│   │   ├── sfx-wave-start.wav
│   │   ├── sfx-game-over.wav
│   │   ├── sfx-powerup-collect.wav
│   │   ├── sfx-powerup-shield.wav
│   │   ├── sfx-powerup-shield-hit.wav
│   │   ├── sfx-powerup-bomb.wav
│   │   └── sfx-powerup-expire.wav
│   └── music/
│       ├── music-menu.ogg
│       └── music-gameplay.ogg
└── data/
    ├── assets.json (update with new entries)
    └── animations.json (update with new animations)
```
