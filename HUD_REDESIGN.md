# HUD Redesign Plan for TCFU

## Overview

Redesign the text-based HUD to use icon-based indicators with segmented progress bars. Assets will be AI-generated using Retro Diffusion Core.

---

## Current State

**Location**: `src/game/scenes/UIScene.ts`

- Row 1 (y=20): Lives text, Wave text, Score text
- Row 2 (y=45): `BOM: ●●○`, `DMG: ●●●`, `FR: ●●●○`, `SPD: ●●●` (12px font, Unicode circles)
- Bottom (y=600): Timed effect progress bars

All rendering is text-based using KenVector Future bitmap font.

**Issues identified:**
1. Text abbreviations (BOM, DMG, FR, SPD) aren't immediately intuitive to players
2. Mixed metaphors - text labels paired with abstract circles
3. Lives displayed as number rather than visual icons
4. Horizontal spread makes scanning slower
5. No visual hierarchy between critical info (lives/bombs) and enhancement info (dmg/speed)

---

## Recommended Redesign

### Design Principles Applied
- **Icons over text** for faster recognition during fast-paced gameplay
- **Visual hierarchy** - critical resources prominent, enhancements secondary
- **Thematic consistency** - use game sprites/pixel art style
- **Progressive indicators** - segmented bars show progression

### Final Layout

```
┌────────────────────────────────────────────────────────────┐
│  🚀🚀🚀🚀🚀×2        WAVE 4              SCORE: 3400      │  y=20
├────────────────────────────────────────────────────────────┤
│  💣[██░] ⚡[███] 🔥[███░] ➡️[███] ⤳[█]                   │  y=45
└────────────────────────────────────────────────────────────┘
                     (gameplay area)
┌────────────────────────────────────────────────────────────┐
│              [INV ████████]  [2X ██████]                  │  y=600
└────────────────────────────────────────────────────────────┘
```

**Legend:** 💣=Bombs, ⚡=Damage, 🔥=Fire Rate, ➡️=Speed, ⤳=Spread Shot

### Row 1: Lives Display (Hybrid Icon + Count)

- Show up to 5 ship sprites (16×16 display size)
- For 6+ lives: show 5 icons + "×N" text (e.g., 🚀🚀🚀🚀🚀×2 for 7 lives)
- Position: x=20, y=20
- Each icon: 16×16 with 2px gap = 18px per icon
- 5 icons = 90px, plus "×N" text if needed (~25px) = 115px max width
- Wave and Score: Keep as-is (clear and expected)

### Row 2: Stat Bar Indicators

**Component structure:**
```
[16×16 icon] [4px gap] [segmented bar 32×8px]
```

**Segmented bar specs:**
- Total width: 32px
- Segments: 3-4 depending on max stacks
- Segment width: 8px with 2px gap
- Height: 8px
- Empty: #333333, Filled: stat color

**Positioning (y=45):**
| Stat | X Position | Max Segments | Color |
|------|------------|--------------|-------|
| Bombs | x=15 | 3 | #ff6600 (orange) |
| Damage | x=70 | 3 | #ff4444 (red) |
| Fire Rate | x=125 | 4 | #ffaa00 (yellow) |
| Speed | x=185 | 3 | #88ffff (cyan) |
| Spread | x=245 | 1 (toggle) | #00aaff (light blue) |

Each indicator width: ~50px (16 icon + 4 gap + 30 bar)

---

## Asset Generation with Retro Diffusion

### Generation Strategy

- **Generate at 64×64px** (Retro Diffusion minimum size), scale to 16×16px in-game
- **Style**: `rd_plus__ui_element` for clean icon aesthetics
- **Use `--removebg`** for transparent backgrounds
- **Use `--seed` parameter** with same seed across all icons for palette consistency

### Prompts for Each Icon

| Icon | Prompt | Color Reference |
|------|--------|-----------------|
| **Bomb** | `pixel art bomb icon, round bomb with fuse, simple silhouette, orange and black --ar 64:64 --style rd_plus__ui_element --removebg` | #ff6600 |
| **Damage** | `pixel art lightning bolt icon, energy symbol, simple silhouette, red glow --ar 64:64 --style rd_plus__ui_element --removebg` | #ff4444 |
| **Fire Rate** | `pixel art flame icon, small fire, simple silhouette, yellow orange --ar 64:64 --style rd_plus__ui_element --removebg` | #ffaa00 |
| **Speed** | `pixel art arrow icon, speed lines, motion blur, simple silhouette, cyan blue --ar 64:64 --style rd_plus__ui_element --removebg` | #88ffff |
| **Spread** | `pixel art triple arrow spread icon, three arrows diverging, simple silhouette, light blue --ar 64:64 --style rd_plus__ui_element --removebg` | #00aaff |
| **Life Ship** | `pixel art small spaceship icon, top-down view, simple white ship, retro arcade --ar 64:64 --style rd_plus__ui_element --removebg` | #ffffff |

**Negative prompt for all**: `muted, dull, hazy, muddy colors, blurry, mutated, deformed, noise, borders, frame, watermark, text`

### Asset File Locations

```
public/assets/images/ui/
├── icon-bomb.png      (64×64, scaled to 16×16 in-game)
├── icon-damage.png    (64×64, scaled to 16×16 in-game)
├── icon-firerate.png  (64×64, scaled to 16×16 in-game)
├── icon-speed.png     (64×64, scaled to 16×16 in-game)
├── icon-spread.png    (64×64, scaled to 16×16 in-game)
└── icon-life.png      (64×64, scaled to 16×16 in-game)
```

---

## Implementation Phases

### Phase 1: Asset Pipeline Setup

**Files to modify:**
- `public/assets/data/assets.json` - Add new icon entries

```json
{ "type": "image", "key": "icon-bomb", "url": "images/ui/icon-bomb.png" },
{ "type": "image", "key": "icon-damage", "url": "images/ui/icon-damage.png" },
{ "type": "image", "key": "icon-firerate", "url": "images/ui/icon-firerate.png" },
{ "type": "image", "key": "icon-speed", "url": "images/ui/icon-speed.png" },
{ "type": "image", "key": "icon-spread", "url": "images/ui/icon-spread.png" },
{ "type": "image", "key": "icon-life", "url": "images/ui/icon-life.png" }
```

### Phase 2: Lives Display

**File**: `src/game/scenes/UIScene.ts`

Replace `livesText` (line 42) with hybrid display:

- Create `livesContainer: Phaser.GameObjects.Container`
- Show up to 5 ship sprites (16×16 display size)
- For 6+ lives: show 5 icons + "×N" text
- Update `updateLives()` to manage sprite visibility and count text

**Animations:** Deferred to polish phase (simple show/hide for v1)

### Phase 3: Stat Bar Indicators

**File**: `src/game/scenes/UIScene.ts`

Replace text indicators (lines 57-85) with icon + segmented bar:

1. Create stat bar component with icon sprite + rectangle segments
2. Update `updateBombs()` to fill/empty segments
3. Update `updateModifiers()` to handle damage, fire rate, speed, spread shot
4. Add spread shot indicator (single toggle segment)

### Phase 4: Update GameConfig

**File**: `src/game/config/GameConfig.ts`

Add to `UI_CONFIG.hud`:
```typescript
statIcon: {
    size: 16,
    gap: 4
},
statBar: {
    width: 32,
    height: 8,
    segmentGap: 2,
    emptyColor: 0x333333
},
livesIcon: {
    size: 16,
    gap: 2,
    maxDisplay: 5
}
```

---

## Files to Modify

1. `public/assets/images/ui/` - New icon files (6 images)
2. `public/assets/data/assets.json` - Register new icons
3. `src/game/scenes/UIScene.ts` - Main HUD rendering (lines 39-85, 117-153)
4. `src/game/config/GameConfig.ts` - UI_CONFIG additions (lines 156-193)

---

## Verification

1. Visual inspection at all powerup states (0 to max stacks)
2. Test lives display from 1-9 lives (verify hybrid ×N format for 6+)
3. Test spread shot indicator toggles correctly
4. Check readability on 360×640 canvas
5. Pause screen still shows relevant info
6. Run `npm run typecheck` and `npm run lint`

---

## References

- [Retro Diffusion Core](./RETRO_DIFFUSION_CORE.md) - AI asset generation tool
- [TCFU Design System](./DESIGN_SYSTEM.md) - Color palette and visual specs
