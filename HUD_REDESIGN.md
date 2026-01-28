# HUD Redesign Plan for TCFU

## Current State Analysis

The current HUD uses developer-focused abbreviations:
- `LIVES: 3` - text with number
- `BOM: ●●○` - abbreviated label with circle indicators
- `DMG: ●●●` - abbreviated label with circle indicators
- `FR: ●●●○` - abbreviated label with circle indicators
- `SPD: ●●●` - abbreviated label with circle indicators

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
- **Progressive indicators** - visual fill/stack shows progression

### Top Row (Critical Info)
| Element | Current | Proposed |
|---------|---------|----------|
| Lives | `Lives: 3` | Ship icons (up to 9) - see details below |
| Wave | `Wave 4` | Keep as-is (clear and expected) |
| Score | `Score: 3400` | Keep as-is (numbers are standard) |

**Lives Display (supports 1-9 lives):**
- Use small player ship sprites (10×10px scaled)
- Compact horizontal row with tight spacing (12px per icon)
- Max width: ~108px for 9 lives (fits left corner)
- Alternative for 6+ lives: two rows of icons, or `🚀×7` format for higher counts

**Lives Layout Options:**
```
Option A: Single row (all icons)
🚀🚀🚀🚀🚀🚀🚀🚀🚀  (tight spacing, may get crowded)

Option B: Hybrid (icons up to 5, then ×N)
🚀🚀🚀🚀🚀×2  (cleaner for high counts)

Option C: Two-row grid (for 6+)
🚀🚀🚀🚀🚀
🚀🚀🚀🚀     (stacked, takes more vertical space)
```
*Recommend Option A with tight spacing - 9 ships at 10px + 2px gap = 108px total*

**Lives Animations:**
- On life lost: ship flashes red, scales down, fades out
- On extra life: ship pops in with scale overshoot (1.0 → 1.3 → 1.0)

### Second Row (Resources & Enhancements)

**Selected Design: Icon + Segmented Bars**
```
💣[██░]   ⚡[███]   🔥[███░]   ➡️[███]
 2/3       3/3       3/4        3/3
```

**Design Details:**
- Leading icon identifies the stat type (no text labels)
- Segmented bar shows filled segments vs total available
- Each segment represents one stack
- Color-coded bars match current palette
- Compact horizontal layout

**Visual Specifications:**
| Stat | Icon | Bar Segments | Fill Color |
|------|------|--------------|------------|
| Bombs | 💣 (bomb sprite) | 3 segments | #ff6600 (orange) |
| Damage | ⚡ (lightning) | 3 segments | #ff4444 (red) |
| Fire Rate | 🔥 (flame) | 4 segments | #ffaa00 (yellow) |
| Speed | ➡️ (arrow/wind) | 3 segments | #88ffff (cyan) |

**Bar Rendering:**
- Bar width: ~30px total
- Segment width: ~8px each with 2px gap
- Height: 8px
- Empty segment: dark gray (#333333)
- Filled segment: stat color
- Icon size: 12×12px

### Final Layout

```
┌──────────────────────────────────────────────────────────┐
│  🚀🚀🚀             WAVE 4              SCORE: 3400     │  ← Row 1: Critical
├──────────────────────────────────────────────────────────┤
│  💣[██░]  ⚡[███]  🔥[███░]  ➡️[███]                    │  ← Row 2: Stats
└──────────────────────────────────────────────────────────┘
                    (gameplay area)
┌──────────────────────────────────────────────────────────┐
│            [INV ████████]  [2X ██████]                   │  ← Timed effects
└──────────────────────────────────────────────────────────┘
```

**Row 1 (y=15):**
- Lives: x=10, ship sprites in a row (10px + 2px spacing each)
- Wave: centered (x=180), keep current style
- Score: right-aligned (x=350)

**Row 2 (y=40):**
- 4 stat indicators with 70px spacing
- Each indicator: 12px icon + 4px gap + ~30px segmented bar
- Starting x=15

### Specific Icon Suggestions

| Stat | Icon Options | Rationale |
|------|--------------|-----------|
| Lives | Player ship sprite (scaled down) | Thematic, clear meaning |
| Bombs | Bomb sprite from game / 💣 | Already have bomb asset |
| Damage | Lightning bolt / crosshair / 🗡️ | Universal "power" symbol |
| Fire Rate | Fire/flame / clock / ⚡ | Speed/rate metaphor |
| Speed | Arrow / wind lines / ➡️ | Movement direction |

### Color Coding (Keep Current)
The existing colors work well:
- Bombs: Orange (#ff6600) - alert/action
- Damage: Red (#ff4444) - aggression
- Fire Rate: Yellow (#ffaa00) - energy
- Speed: Cyan (#88ffff) - movement

---

## Implementation Approach

### Phase 1: Asset Preparation
1. Create simple pixel art icon sprites (12×12 pixels):
   - `icon-bomb.png` - bomb silhouette (orange/black)
   - `icon-damage.png` - lightning bolt (red/white)
   - `icon-firerate.png` - flame (yellow/orange)
   - `icon-speed.png` - arrow/wind lines (cyan)
2. Scale down existing player ship sprite for lives display (10×10)
3. Add new icons to asset pack (`assets.json`)
4. Place icons in `public/assets/images/ui/`

### Phase 2: UIScene Updates - Lives Display
1. Replace `Lives: N` text with ship sprite array
2. Create `createLivesDisplay()` method with sprite pool (9 max)
3. Add animations:
   - `animateLifeLost()`: flash red → scale 1.0→0 → destroy
   - `animateLifeGained()`: create at scale 0 → overshoot 1.3 → settle 1.0
4. Update `updateLives()` to add/remove sprites with animation

### Phase 3: UIScene Updates - Stat Bars
1. Create `StatBarIndicator` class/container:
   - Icon sprite (12×12)
   - Segmented bar (N rectangles based on max stacks)
   - Methods: `setStacks(current, max)`, `animateChange()`
2. Replace text-based indicators with StatBarIndicator instances
3. Add subtle pulse animation when segment fills/empties

### Phase 4: Layout & Polish
1. Adjust positions in `UI_CONFIG` for new element sizes
2. Ensure proper spacing between elements
3. Test at all powerup states

### Files to Modify
- `src/game/scenes/UIScene.ts` - main HUD rendering
- `src/game/config/GameConfig.ts` - UI_CONFIG positions/spacing
- `public/assets/data/assets.json` - new icon sprites
- `public/assets/images/` - icon sprite files

---

## Verification Plan
1. Visual inspection in-game at different powerup states
2. Check readability on 360×640 canvas size
3. Test all powerup combinations (0-max stacks)
4. Verify animations on state changes
5. Test pause screen still shows relevant info

---

## References
- [Game HUD Design Techniques - Indie Dev Guide](https://www.indiedevguide.com/articles/game-hud-design-techniques-ui-ux-indie-devs/)
- [Game UI Database](https://gameuidatabase.com/) - for reference screenshots
- [How To Design A Good HUD - Rocketbrush](https://rocketbrush.com/blog/designing-practical-and-pretty-hud-in-video-games)
