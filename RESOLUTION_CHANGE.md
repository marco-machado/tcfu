# Resolution Change: 360x640 → 540x960

## Overview

Scale the game resolution by **1.5x** while maintaining identical gameplay feel. All pixel positions, dimensions, and velocities will be scaled proportionally.

### Motivation

This resolution change is driven by **feedback from testing groups** who reported:
- Visual clarity issues on modern high-DPI mobile displays
- Desire for more detailed sprites while maintaining retro aesthetic
- Better scaling to common device resolutions (Full HD, 4K)

### Why 540x960?

- **Clean integer scaling**: 2x to 1080x1920 (Full HD portrait), 4x to 4K portrait
- **Detailed pixel art**: More screen real estate while keeping chunky pixel aesthetic
- **9:16 aspect ratio**: Same portrait orientation as before

See [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) for full rationale and alternative resolutions considered.

---

## Code Changes Required

### 1. `src/game/config/GameConfig.ts` (~70 values)

**Core dimensions:**
- `width: 360` → `540`
- `height: 640` → `960`

**Player config:**
- `spawnOffsetFromBottom: 100` → `150`
- `velocity: 200` → `300`

**Enemy config:**
- `spawnPaddingX: 20` → `30`
- `spawnY: -50` → `-75`
- `velocityY: 100` → `150`
- `cleanupOffsetY: 100` → `150`

**Player weapon config:**
- `spawnOffsetY: -20` → `-30`
- `velocityY: -400` → `-600`
- `cleanupThresholdY: 100` → `150`

**Enemy weapon config:**
- `spawnOffsetY: 20` → `30`
- `velocityY: 210` → `315`
- `cleanupOffsetY: 50` → `75`

**Powerup config:**
- `spawnY: -30` → `-45`
- `velocityY: 80` → `120`
- `cleanupOffsetY: 50` → `75`
- `magnetRadius: 120` → `180`
- `magnetSpeed: 250` → `375`
- `spawnPaddingX: 30` → `45`

**Wave config:**
- `spawnPaddingX: 20` → `30`
- `spawnY: -50` → `-75`
- `cleanupOffsetY: 100` → `150`
- `baseVelocityY: 100` → `150`
- `maxVelocityY: 176` → `264`
- `velocityIncreasePerWave: 8` → `12`
- `spacingX: 30` → `45`
- `spacingY: 26` → `39`

**UI config - HUD:**
- `timedEffectsContainerOffsetY: 40` → `60`
- `timedEffectBarWidth: 40` → `60`
- `timedEffectBarHeight: 6` → `9`
- `timedEffectSpacing: 50` → `75`
- Lives: `x: 15` → `22`, `y: 20` → `30`, `iconSize: 16` → `24`, `iconGap: 2` → `3`, `overflowTextGap: 4` → `6`
- StatBar: `x: 15` → `22`, `startY: 45` → `68`, `rowGap: 20` → `30`, `iconSize: 16` → `24`, `iconToBarGap: 4` → `6`, `segmentWidth: 4` → `6`, `segmentGap: 2` → `3`, `barHeight: 16` → `24`

**UI config - Announcements:**
- `waveOffsetY: 50` → `75`
- `powerUpBaseOffsetY: 60` → `90`
- `powerUpStackSpacing: 30` → `45`
- `powerUpAnimOffsetY: 40` → `60`
- `shieldBlockedOffsetY: 30` → `45`

**UI config - Game Over:**
- `textOffsetY: 30` → `45`
- `highScoreOffsetY: 10` → `15`
- `scoreOffsetY: 40` → `60`
- `instructionsOffsetY: 80` → `120`

**UI config - Pause:**
- `textOffsetY: 20` → `30`
- `hintOffsetY: 30` → `45`
- `debugKeysOffsetY: 70` → `105`

**Menu config:**
- `startButtonOffsetY: 50` → `75`
- `clearButtonOffsetY: 100` → `150`
- `instructionsOffsetFromBottom: 50` → `75`

**Touch controls config:**
- Pause button: `x: 330` → `495`, `y: 70` → `105`, `radius: 20` → `30`
- Left button: `x: 50` → `75`, `y: 595` → `893`, `radius: 40` → `60`
- Right button: `x: 310` → `465`, `y: 595` → `893`, `radius: 40` → `60`
- Bounds: `paddingX: 20` → `30`, `minY: 100` → `150`, `maxYOffset: 50` → `75`

### 2. `src/game/scenes/BootScene.ts` (3 values)

- `barWidth = 200` → `300`
- `barHeight = 10` → `15`
- Y offset from bottom: `60` → `90`

### 3. `src/game/scenes/UIScene.ts` (3 values)

- Score text right margin: `20` → `30`
- Game over button spacing: `40` → `60`
- Pause button spacing: `40` → `60`

### 4. `public/assets/data/assets.json` (frame configs)

- `player-base-engine-effects`: `frameWidth/Height: 48` → `72`
- `klaed-scout-engine`: `frameWidth/Height: 64` → `96`
- `klaed-scout-bullet`: `frameWidth: 4, frameHeight: 16` → `6, 24`
- All 10 powerups: `frameWidth/Height: 24` → `36`

---

## Files That Auto-Scale (No Changes Needed)

These use dynamic calculations with `this.scale.width/height`:
- `src/game/main.ts` - reads from GAME_CONFIG
- `src/game/entities/Player.ts` - uses scene.scale
- `src/game/systems/EnemySpawnerSystem.ts` - uses config + scene.scale
- `src/game/scenes/MainMenuScene.ts` - uses scene.scale
- `src/game/scenes/GameScene.ts` - uses config + scene.scale

---

## Assets Requiring Regeneration

All assets scale by **1.5x**. Use [RETRO_DIFFUSION_CORE.md](./RETRO_DIFFUSION_CORE.md) for tool setup and [ASSET_PROMPT_GUIDE.md](./ASSET_PROMPT_GUIDE.md) for prompt templates.

> **Note:** Pixel art asset regeneration is deferred pending changes to our generation software pipeline. The prompts and specifications below remain valid but implementation will be addressed in a separate phase. Code changes can proceed independently using placeholder scaled assets (nearest-neighbor upscaling of originals).

### Player Assets

| Asset | File | Current | Target | Retro Diffusion Prompt |
|-------|------|---------|--------|------------------------|
| Player Ship | `public/assets/images/player_ship.png` | 48×48 | 72×72 | `"player spaceship, sleek fighter design, white and silver colors, glowing red engine exhaust, top-down view, retro arcade style" --ar 72:72 --style rd_fast__game_asset --removebg` |
| Player Engine | `public/assets/images/player_base_engine.png` | 48×48 | 72×72 | `"spaceship engine flame effect, orange red glow, top-down view, pixel art" --ar 72:72 --style rd_fast__game_asset --removebg` |
| Player Engine Effects | `public/assets/images/player_base_engine_effects.png` | 192×96 (4 frames @ 48×48) | 288×144 (4 frames @ 72×72) | `"spaceship engine flame animation spritesheet, orange red glow, 4 frames horizontal, top-down view" --ar 288:144 --style rd_fast__game_asset --removebg` |
| Player Projectile | `public/assets/images/player_bullet.png` | 6×18 | 9×27 | `"red laser beam projectile, glowing energy trail, vertical orientation, pixel art" --ar 9:27 --style rd_fast__game_asset --removebg` |

### Enemy Assets (Klaed Scout)

| Asset | File | Current | Target | Retro Diffusion Prompt |
|-------|------|---------|--------|------------------------|
| Klaed Scout Ship | `public/assets/images/klaed_scout_ship.png` | 64×64 | 96×96 | `"enemy alien spaceship, menacing angular shape, dark red burgundy colors, hostile design, top-down view, pixel art" --ar 96:96 --style rd_fast__game_asset --removebg` |
| Klaed Scout Engine | `public/assets/images/klaed_scout_engine.png` | 640×64 (10 frames @ 64×64) | 960×96 (10 frames @ 96×96) | `"enemy spaceship cyan engine flame animation spritesheet, blue glow, 10 frames horizontal, top-down view" --ar 960:96 --style rd_fast__game_asset --removebg` |
| Klaed Scout Bullet | `public/assets/images/klaed_scout_bullet.png` | 16×16 | 24×24 | `"orange yellow energy projectile, glowing plasma bolt, enemy weapon, pixel art" --ar 24:24 --style rd_fast__game_asset --removebg` |

### Powerup Assets (all in `public/assets/images/powerups/`)

| Asset | File | Current | Target | Retro Diffusion Prompt |
|-------|------|---------|--------|------------------------|
| Extra Life | `extra_life.png` | 24×24 | 36×36 | `"1-up extra life icon, small spaceship silhouette, pink glow, pixel art game item" --ar 36:36 --style rd_fast__game_asset --removebg` |
| Fire Rate | `fire_rate.png` | 24×24 | 36×36 | `"rapid fire upgrade icon, speed arrows symbol, orange glow, pixel art" --ar 36:36 --style rd_fast__game_asset --removebg` |
| Damage | `damage.png` | 24×24 | 36×36 | `"damage boost power-up, red explosive icon, weapon enhancement, pixel art" --ar 36:36 --style rd_fast__game_asset --removebg` |
| Spread Shot | `spread_shot.png` | 24×24 | 36×36 | `"spread shot weapon upgrade, triple barrel icon, blue metallic, pixel art" --ar 36:36 --style rd_fast__game_asset --removebg` |
| Speed Up | `speed_up.png` | 24×24 | 36×36 | `"speed boost power-up, cyan lightning bolt icon, fast movement, pixel art" --ar 36:36 --style rd_fast__game_asset --removebg` |
| Invincibility | `invincibility.png` | 24×24 | 36×36 | `"invincibility star power-up, golden glowing aura, protective shield, pixel art" --ar 36:36 --style rd_fast__game_asset --removebg` |
| Shield | `shield.png` | 24×24 | 36×36 | `"blue energy shield power-up orb, glowing protective aura, pixel art item" --ar 36:36 --style rd_fast__game_asset --removebg` |
| Magnet | `magnet.png` | 24×24 | 36×36 | `"magnet power-up icon, magenta purple horseshoe magnet, attraction effect, pixel art" --ar 36:36 --style rd_fast__game_asset --removebg` |
| Score Multiplier | `score_multiplier.png` | 24×24 | 36×36 | `"2x score multiplier icon, green glowing numbers, bonus points, pixel art" --ar 36:36 --style rd_fast__game_asset --removebg` |
| Bomb | `bomb.png` | 24×24 | 36×36 | `"bomb power-up icon, orange red explosive, screen clear weapon, pixel art" --ar 36:36 --style rd_fast__game_asset --removebg` |

### UI Assets

| Asset | File | Current | Target | Retro Diffusion Prompt |
|-------|------|---------|--------|------------------------|
| Icon: Bomb | `public/assets/images/icon-bomb.png` | 64×64 | 96×96 | `"bomb HUD icon, orange explosive symbol, minimalist pixel art UI element" --ar 96:96 --style rd_fast__ui --removebg` |
| Icon: Damage | `public/assets/images/icon-damage.png` | 64×64 | 96×96 | `"damage HUD icon, red attack symbol, minimalist pixel art UI element" --ar 96:96 --style rd_fast__ui --removebg` |
| Icon: Fire Rate | `public/assets/images/icon-firerate.png` | 64×64 | 96×96 | `"fire rate HUD icon, orange speed symbol, minimalist pixel art UI element" --ar 96:96 --style rd_fast__ui --removebg` |
| Icon: Speed | `public/assets/images/icon-speed.png` | 64×64 | 96×96 | `"speed HUD icon, cyan lightning symbol, minimalist pixel art UI element" --ar 96:96 --style rd_fast__ui --removebg` |
| Icon: Life | `public/assets/images/icon-life.png` | 64×64 | 96×96 | `"life HUD icon, heart or ship symbol, minimalist pixel art UI element" --ar 96:96 --style rd_fast__ui --removebg` |
| Title Logo | `public/assets/images/title-logo.png` | 280×80 | 420×120 | `"TCFU game title logo, They Came From Uranus, retro arcade sci-fi text, pixel art" --ar 420:120 --style rd_fast__game_asset --removebg` |

### Background Assets

| Asset | File | Current | Target | Notes |
|-------|------|---------|--------|-------|
| Deep Space | `public/assets/images/deep_space.jpg` | 2368×1792 | Keep or 3552×2688 | Large enough to tile at new resolution - may not need regeneration |
| Background 2 | `public/assets/images/background2.png` | 350×400 | 525×600 | If used: `"deep space starfield background, twinkling stars, dark blue black void, pixel art" --ar 525:600 --style rd_fast__texture --tile` |

---

## Asset Summary

**Total: 25 image files to regenerate**
- 4 player assets
- 3 enemy assets
- 10 powerup assets
- 6 UI assets
- 2 background assets (may be optional)

---

## Verification

### 1. Code Quality
- Run `npm run typecheck` - ensure no TypeScript errors
- Run `npm run lint` - ensure no linting errors

### 2. Visual Verification
After assets regenerated (or using placeholder scaled assets):
- Boot scene: loading bar centered and sized correctly
- Main menu: title and buttons positioned correctly
- Gameplay: enemies spawn within bounds, projectiles fire correctly
- HUD: lives, stats, wave display positioned correctly
- Powerups: spawn, fall, and magnet attraction work
- Pause/Game Over screens: text and buttons aligned
- Touch controls: all buttons positioned correctly and responsive

### 3. Mobile Performance Testing

**Target Devices:**
- Mid-range Android: Samsung Galaxy A54, Moto G Power, Pixel 6a (or equivalent)
- Older iOS: iPhone 8, iPhone SE 2nd gen (or equivalent)

**Acceptable Performance Thresholds:**

| Metric | Target | Minimum Acceptable | Failure |
|--------|--------|-------------------|---------|
| Average FPS | 60 | 55 | <50 |
| 1% Low FPS | 55 | 45 | <40 |
| Frame time spikes | <20ms | <33ms | >50ms |
| Memory usage increase | <25% | <40% | >50% |
| Touch input latency | <16ms | <33ms | >50ms |

**If minimum acceptable thresholds are not met**, the resolution change should be:
1. Profiled to identify bottlenecks
2. Optimized (object pooling, reduced overdraw, etc.)
3. Re-tested before proceeding
4. If still failing: implement dynamic resolution scaling or revert

### 4. Graze System Acceptance Criteria

The graze system must feel identical before and after the resolution change:

| Criterion | Test Method | Pass Condition |
|-----------|-------------|----------------|
| Graze detection radius | Measure in debug mode | 12px beyond hitbox (54px total detection zone) |
| Visual feedback timing | Frame-by-frame capture | White spark appears within 1 frame of near-miss |
| Graze points awarded | Compare 5-minute sessions | Within ±10% of pre-change average graze count |
| Perceptual "close call" feel | Blind A/B playtest (5+ testers) | >80% cannot distinguish resolution versions |
| Graze cooldown per bullet | Code review + test | 100ms unchanged |

**Blind A/B Test Protocol:**
1. Prepare builds at both resolutions with identical gameplay recordings
2. Show testers randomized clips, ask them to identify "which feels like a closer miss"
3. If testers consistently identify one version as different, investigate and adjust

---

## Animation Timing Note

Sprite dimensions scale by 1.5x, but **animation frameRates remain unchanged**. This is intentional:
- Animations are defined in `public/assets/data/animations.json` with explicit `frameRate` values
- Frame timing is independent of sprite size in Phaser
- The visual "speed" of animations should feel identical since they cover proportionally more pixels in the same time

If animations feel sluggish after scaling, consider increasing frameRate by 1.5x as well, but test first—unchanged rates should maintain feel.

---

## Required Documentation Updates

The following documents **must be updated as part of this work** to maintain documentation consistency. All updates should be included in the same PR as the code changes.

### GAME_DESIGN_DOCUMENT.md

**Section 1.5 (Platform & Technical)** — Update resolution reference:
- Change: `Resolution: 360x640 portrait` → `Resolution: 540x960 portrait`
- Add note about 1.5x scaling from original

**Section 5.4 (Player Survivability)** — After implementation confirms values, update:
- Player hitbox: `28x28px` → `42x42px`
- Graze hitbox: `36x36px` → `54x54px`
- Player sprite reference: `32px` → `48px`

**Section 3.3.4 (Graze System)** — After implementation confirms values, update:
- Graze Radius: `8px beyond hitbox (36px total)` → `12px beyond hitbox (54px total)`

### DESIGN_SYSTEM.md

**Canvas & Display section:**
- Change: `Dimensions | 360 x 640 pixels` → `Dimensions | 540 x 960 pixels`

**Sprite Dimensions table:**
- Player ship: `~32 x 32px` → `~48 x 48px`
- Player engine effects: `48 x 48px` → `72 x 72px`
- Enemy ship: `~32 x 32px` → `~48 x 48px`
- Enemy engine: `64 x 64px` → `96 x 96px`
- Player projectile: `4 x 12px` → `6 x 18px`
- Enemy projectile: `4 x 16px` → `6 x 24px`
- Powerup sprites: `24 x 24px` → `36 x 36px`

**Collision Bodies table:**
- Player: `28 x 28px` → `42 x 42px`, offset `(-14, -14)` → `(-21, -21)`
- Klaed Scout: `24 x 26px` → `36 x 39px`, offset `(-12, -18)` → `(-18, -27)`
- Player bullet: `4 x 12px` → `6 x 18px`

**Reference: Game Constants section:**
- `GAME_WIDTH`: `360` → `540`
- `GAME_HEIGHT`: `640` → `960`
- `PLAYER_CONFIG.velocity`: `200` → `300`
- `ENEMY_CONFIG.velocityY`: `100` → `150`
- `WEAPON_CONFIG.cooldown`: unchanged (800ms)
- `WAVE_CONFIG.baseSpawnRate`: unchanged (2000ms)

### CLAUDE.md

**Architecture section (Game canvas):**
- Change: `Game canvas: 360x640 pixels` → `Game canvas: 540x960 pixels`

### README.md (if resolution is mentioned)

Update any resolution references to reflect the new 540x960 dimensions.

### Asset Documentation

Any asset pipeline documentation referencing sprite dimensions should be updated to reflect the 1.5x scaled values.

---

## Decision Log

### Analysis Trigger

This section was added following a design review prompted by:

> "You are a veteran game designer that worked on AAA titles and specializes in pixel art games. You were asked to analyse the RESOLUTION_CHANGE.md document and report your findings."

### Decisions Made

| # | Concern | Decision | Rationale |
|---|---------|----------|-----------|
| 1 | GDD still references 360×640 resolution | **Must update GDD as part of this work** | GDD is source of truth; inconsistency causes confusion |
| 2 | Hitbox scaling not documented | **Update GDD after implementation confirms values** | Hitboxes (28→42, 36→54) must scale to maintain gameplay feel; verify in code first |
| 3 | Frame animation timing not addressed | **Documented above; no change needed** | Phaser frameRate is independent of sprite size; animations should feel identical |
| 4 | Mobile performance risk with larger canvas | **Added to Verification checklist with thresholds** | 540×960 is 2.25x more pixels; must validate 60 FPS on target devices |
| 5 | AI asset regeneration quality concerns | **Deferred** | Asset generation software changes in progress; will address separately |
| 6 | Touch controls config not in change list | **Added to code changes** | TOUCH_CONTROLS_CONFIG has hardcoded positions that must scale |
| 7 | DESIGN_SYSTEM.md inconsistency | **Added to required documentation updates** | All design docs must stay synchronized |
| 8 | Graze system feel validation | **Added acceptance criteria** | Near-miss perception must feel identical; requires blind A/B testing |
| 9 | Missing motivation for change | **Added to Overview** | Testing group feedback drove this decision |

### Open Items for Implementation

- [ ] Update `GAME_DESIGN_DOCUMENT.md` Section 1.5 with new resolution
- [ ] Update `DESIGN_SYSTEM.md` with all scaled dimensions
- [ ] Update `CLAUDE.md` with new canvas dimensions
- [ ] Verify hitbox values in entity code scale correctly (or add to GameConfig if hardcoded)
- [ ] Verify graze detection radius scales correctly
- [ ] Update GDD Sections 5.4 and 3.3.4 with confirmed hitbox/graze values post-implementation
- [ ] Complete mobile performance testing per Verification section
- [ ] Conduct graze system blind A/B testing
- [ ] Generate placeholder scaled assets (nearest-neighbor) for initial testing
