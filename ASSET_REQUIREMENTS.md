# TCFU Asset Requirements

This document lists visual and audio assets needed to improve TCFU's UI and gameplay, based on the design system specifications.

---

## Current State Summary

**Existing Assets:**
- Player sprites (ship, engine, engine effects animation)
- Enemy sprites (Klaed Scout ship, engine animation, bullet animation)
- Player bullet sprite
- Scrolling space background

**Current UI Implementation:**
- All UI is text-based (no graphics)
- Buttons are styled text boxes with background colors
- HUD uses plain text for lives, score, wave
- No visual icons or panels

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

#### 3.4 Music
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
│   │   └── sfx-game-over.wav
│   └── music/
│       ├── music-menu.ogg
│       └── music-gameplay.ogg
└── data/
    ├── assets.json (update with new entries)
    └── animations.json (update with new animations)
```
