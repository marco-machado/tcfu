# They Came From Uranus — Game Design Document

**Version 2.0 | January 2026 | Planning Document**

---

## Table of Contents

1. [Game Overview](#1-game-overview)
2. [Story & Lore](#2-story--lore)
3. [Core Mechanics](#3-core-mechanics)
4. [Enemy & Boss Design](#4-enemy--boss-design)
5. [Progression & Balancing](#5-progression--balancing)
6. [Game Feel & Juice](#6-game-feel--juice)
7. [Future Features & Roadmap](#7-future-features--roadmap)
8. [Design Decision Log](#8-design-decision-log)

---

## 1. Game Overview

### 1.1 Vision Statement

They Came From Uranus (TCFU) is a retro arcade-style vertical space shooter that captures the essence of classic 1980s-90s arcade games like Galaga, 1942, and Phoenix. The game delivers fast-paced, score-chasing gameplay with modern quality-of-life features while maintaining authentic pixel art aesthetics and simple, addictive mechanics.

### 1.2 Core Pillars

- **Accessible Challenge**: Easy to learn, difficult to master gameplay loop
- **Score Obsession**: Every session should leave players wanting one more run
- **Retro Authenticity**: Pixel-perfect visuals and arcade feel without dated frustrations
- **Meaningful Progression**: Each wave feels distinct with escalating intensity
- **Satisfying Feel**: Every action has weight, feedback, and "juice"

### 1.3 Current State

The game is a feature-complete prototype with the following implemented:

- Player ship with keyboard and mobile touch controls
- Single enemy type (Klaed Scout) with AI firing
- 10 powerup types across three categories (permanent, instant, timed)
- Score-based wave progression with difficulty scaling
- Bomb system for screen clearing
- High score persistence
- Full pause system with timer preservation

### 1.4 Target Audience

- **Primary**: Retro gaming enthusiasts (25-45) who grew up with arcade shooters
- **Secondary**: Mobile casual gamers seeking quick, satisfying gameplay sessions
- **Tertiary**: Speedrunners and score-chasers who enjoy optimization

### 1.5 Platform & Technical

- **Primary Platform**: Web browser (desktop and mobile)
- **Engine**: Phaser 3.90.0 with TypeScript
- **Resolution**: 360x640 portrait (mobile-first design)
- **Target Performance**: 60 FPS on mid-range devices

---

## 2. Story & Lore

### 2.1 Setting Overview

The year is 2187. Humanity has colonized the inner solar system, establishing thriving settlements on Mars and mining operations throughout the asteroid belt. Earth remains the cultural and political center of human civilization, protected by the United Earth Defense Force (UEDF).

For decades, deep space listening posts detected anomalous signals from beyond Neptune. Scientists dismissed them as cosmic noise. They were wrong.

### 2.2 The Uranian Threat

The Klaed Empire has lurked in the frozen depths of Uranus for millennia, an ancient civilization that arrived in our solar system long before humanity evolved. They watched. They waited. They prepared.

#### 2.2.1 The Klaed

The Klaed are a hive-minded species that communicate through quantum-entangled neural networks. Individual Klaed possess limited autonomy but perfect coordination, making their fleet movements eerily synchronized and devastatingly efficient.

- **Biology**: Silicon-based lifeforms adapted to extreme cold environments
- **Society**: Hierarchical hive structure with a central Overmind
- **Technology**: Organic-mechanical hybrid ships grown rather than built
- **Motivation**: Cognitive harvesting — the hive mind requires periodic infusion of novel neural patterns from other sentient species to prevent collective stagnation and decay

#### 2.2.2 Why Now?

The Klaed hive mind is dying. After millennia of isolation, their collective consciousness has grown stagnant, recycling the same thoughts in an endless loop of cognitive decay. They've watched humanity evolve from primitive apes to a spacefaring species — and they've been *hungry* for what we've become.

Humanity's expansion into the asteroid belt wasn't a threat. It was an opportunity. Our radio signals, our digital networks, our seven billion individual minds — to the Overmind, we're not enemies. We're a feast. The scout waves aren't meant to destroy humanity. They're meant to *map* us — cataloging neural patterns for eventual harvest and assimilation into the hive.

### 2.3 The Player

You pilot the XF-7 Defender, an experimental single-seat interceptor designed for exactly this scenario. While Earth's main fleet engages the Klaed armada in the outer system, small strike craft like yours are humanity's last line of defense against the scout waves penetrating inner system defenses.

#### 2.3.1 The XF-7 Defender

- **Classification**: Light interceptor / point defense
- **Armament**: Rapid-fire plasma cannons with Overcharge capability, modular hardpoints
- **Special Systems**: Experimental powerup absorption matrix, Plasma Overcharge Core
- **Crew**: Single pilot

The XF-7's unique feature is its ability to integrate salvaged Klaed technology on the fly. Destroyed enemy ships sometimes eject containment pods that your ship's absorption matrix can process, granting temporary or permanent combat enhancements.

### 2.4 Narrative Arc

TCFU follows an implied narrative through wave progression:

#### Waves 1-5: First Contact
Initial scout waves probe Earth's defenses. Light resistance, reconnaissance-focused enemies. The Klaed are testing humanity's response capabilities.

#### Waves 6-10: Escalation
The Klaed commit more resources. Formations become coordinated. Enemy fire increases. The true invasion begins.

#### Waves 11-15: Siege
Heavy assault waves with elite units. The player faces overwhelming odds as the Klaed push toward Earth.

#### Waves 16-20: Desperation
Boss encounters punctuate relentless waves. Humanity's survival hangs by a thread. The Overlord falls at Wave 20.

#### Wave 21+: The Loop (Endless War)
Defeating the Overlord doesn't end the war — it **loops**. Waves 21-40 replay the same content as Waves 1-20, but with increased difficulty modifiers. Each 20-wave cycle is a "Loop."

- **Loop 1** (Waves 1-20): The learning run. Most players die here.
- **Loop 2+** (Waves 21-40, 41-60, etc.): Mastery runs with scaled difficulty.

The Overmind Fragment — the true threat — only appears to pilots skilled enough to reach Loop 2 (see Section 4.5.3).

### 2.5 Tone & Atmosphere

- **Visual**: Retro pixel art with a vibrant color palette (not grimdark)
- **Audio**: Upbeat chiptune soundtrack with tension-building progression
- **Narrative**: Light touch, shown through gameplay rather than cutscenes
- **Overall**: Fun and exciting, not grim or hopeless

---

## 3. Core Mechanics

### 3.1 Overcharge System (Risk/Reward)

The Overcharge system is TCFU's signature risk/reward mechanic, inspired by classic shooter depth mechanics like Galaga's ship capture.

#### 3.1.1 How It Works

| State | Description |
|-------|-------------|
| **Normal Fire** | Tap/hold fire for standard rapid shots |
| **Charging** | Hold fire for 1.5s without releasing to begin charge |
| **Charged** | Visual/audio indicator shows full charge ready |
| **Overcharge Shot** | Release to fire devastating blast |

#### 3.1.2 Overcharge Properties

| Property | Value |
|----------|-------|
| Charge Time | 1.5 seconds |
| Damage | 5x normal shot |
| Projectile Size | 3x normal (12x36px) |
| Piercing | Passes through up to 3 enemies |
| Cooldown | 3 seconds before next charge possible |

#### 3.1.3 The Risk

While charging, the player **cannot fire normal shots**. This creates a vulnerability window where:
- Incoming enemies cannot be suppressed
- The player must rely purely on dodging
- Mistiming wastes the charge window

#### 3.1.4 Visual Feedback

| Charge State | Visual Indicator |
|--------------|------------------|
| 0-50% | Ship glows faintly, subtle hum |
| 50-100% | Bright pulsing glow, intensifying hum |
| Ready | Ship flashes white, high-pitched ready tone |
| Firing | Screen flash, dramatic beam effect |

#### 3.1.5 Strategic Use Cases

- **Boss Vulnerable Phases**: Maximize damage during exposed weak points
- **Formation Clusters**: Pierce through lined-up enemies
- **Guardian Shields**: Overcharge breaks shields in one hit
- **Desperation Play**: High risk when overwhelmed, high reward if landed

### 3.2 Powerup Synergy System

Certain powerup combinations trigger special synergy effects. This creates build variety and makes "weak" powerups valuable in the right context.

#### 3.2.1 Synergy List (8 Total)

| Synergy Name | Requirements | Effect |
|--------------|--------------|--------|
| **Devastator** | Spread Shot + Damage Up (2+) | Spread shots explode on hit (8px splash) |
| **Bullet Storm** | Fire Rate (3) + Speed Up (2+) | Shots have slight homing (5° correction) |
| **Glass Cannon** | Damage Up (3) + No Shield | +50% damage, but hits deal 2 lives |
| **Fortress** | Shield + Speed Up (2+) | Shield reflects 1 bullet back at enemies |
| **Magnetic Devastation** | Magnet + Bomb | Bomb pulls all powerups to player before detonating |
| **Score Frenzy** | Score Multiplier + Invincibility | 3X score instead of 2X while both active |
| **Rapid Recovery** | Fire Rate (2+) + Extra Life collected | 0.5s invincibility on every 10th kill |
| **Overcharge Mastery** | Damage Up (3) + Spread Shot | Overcharge fires 3 beams in spread pattern |

#### 3.2.2 Synergy Discovery

- Synergies are **not explained upfront** — players discover them through play
- First activation shows a **"SYNERGY UNLOCKED: [Name]"** announcement
- Discovered synergies appear in pause menu's "Synergies" tab
- Creates "eureka moments" and encourages experimentation

#### 3.2.3 Synergy Balance Notes

- Synergies require specific investment, preventing accidental activation
- "Glass Cannon" is high-skill only — intentionally punishing
- No synergy is mandatory for progression
- Synergies stack with Score Multiplier for scoring depth

### 3.3 Scoring System

#### 3.3.1 Base Point Values

| Action | Points | Multiplier Affected |
|--------|--------|---------------------|
| Klaed Scout destroyed | 100 | Yes |
| Klaed Striker destroyed | 150 | Yes |
| Klaed Bomber destroyed | 250 | Yes |
| Klaed Guardian destroyed | 300 | Yes |
| Klaed Sniper destroyed | 200 | Yes |
| Klaed Swarm destroyed | 25 | Yes |
| Boss defeated | 5000-50000 | Yes |
| Wave completion | Wave × 100 | No |
| Perfect Wave bonus | Wave × 500 | No |

#### 3.3.2 Formation Destruction Bonus

Destroying all enemies in a formation before any escape awards bonus points:

| Formation Size | Bonus | Notes |
|----------------|-------|-------|
| 2-ship formation | +200 | "FORMATION BONUS" announcement |
| 3-ship formation | +500 | "FORMATION BONUS" announcement |
| 5-ship formation | +1000 | "PERFECT FORMATION" announcement |

Formations are visually indicated by **faint connecting lines** between ships during spawn.

#### 3.3.3 Combo System

Consecutive kills without taking damage build a combo multiplier:

| Combo Kills | Multiplier | Visual |
|-------------|------------|--------|
| 1-4 | 1.0x | None |
| 5-9 | 1.2x | "COMBO x5" |
| 10-19 | 1.5x | "COMBO x10" (yellow) |
| 20-34 | 2.0x | "COMBO x20" (orange) |
| 35-49 | 2.5x | "COMBO x35" (red) |
| 50+ | 3.0x | "COMBO x50!" (flashing) |

- Combo resets on taking damage (not on shield absorb)
- Combo multiplier stacks with 2X Score powerup
- Maximum effective multiplier: 6.0x (3.0 combo × 2.0 powerup)

#### 3.3.4 Graze System

Near-misses with enemy bullets award graze points:

| Property | Value |
|----------|-------|
| Graze Radius | 8px beyond hitbox (36px total detection) |
| Points per Graze | 10 |
| Graze Cooldown | 100ms per bullet (prevents farming) |
| Visual | Brief white spark on player ship |
| Audio | Subtle "ting" sound |

Graze encourages aggressive positioning and rewards skilled dodging.

#### 3.3.5 Accuracy Tracking

The game tracks shooting accuracy as a secondary metric:

| Metric | Calculation |
|--------|-------------|
| Accuracy % | (Hits / Shots Fired) × 100 |
| Efficiency Rating | Enemies Killed / Shots Fired |

Displayed on:
- Wave completion stats
- Game over screen
- High score entries (as tiebreaker)

### 3.4 Bonus Stages

#### 3.4.1 Perfect Wave Trigger

Completing a wave **without taking damage** (shield absorbs count as "no damage") awards a **Perfect Star**. Stars accumulate across the run:

| Property | Value |
|----------|-------|
| Stars to trigger Bonus Stage | 3 |
| Star counter | Persists until spent |
| Star display | HUD shows current star count (0-2) |
| Visual feedback | Star icon flies to counter on perfect wave |

When the player earns their 3rd star, a Bonus Stage triggers before the next wave and the counter resets to 0. This creates anticipation ("one more perfect wave!") and makes each flawless performance feel meaningful even when it doesn't immediately trigger a bonus.

#### 3.4.2 Bonus Stage Rules

| Property | Value |
|----------|-------|
| Duration | 15 seconds |
| Enemies | Non-threatening "Target Drones" |
| Target Drones | No collision damage, no shooting |
| Drone Points | 50 each |
| Drone Count | 30 drones in set patterns |
| Perfect Bonus | All 30 destroyed = 5000 bonus |
| Powerup Reward | 1 guaranteed powerup at end |

#### 3.4.3 Bonus Stage Patterns

Target Drones appear in learnable patterns:
- **Wave pattern**: Drones fly in sine-wave formations
- **Spiral pattern**: Drones spiral inward toward center
- **Grid pattern**: Static grid that scrolls down
- **Random pattern**: Chaotic movement (harder)

Pattern selection is deterministic based on wave number for consistency.

#### 3.4.4 Strategic Value

- Bonus stages provide **mental breathers** between intense waves
- Perfect Bonus (5000 pts) is significant for high scores
- Guaranteed powerup rewards skilled play
- Star counter creates **persistent mini-goal**: every perfect wave matters
- Near-miss tension: "I have 2 stars, just need one more!"
- Skilled players can chain bonus stages by maintaining consistency

### 3.5 Session Checkpoints

Every 5 waves, the game displays a **Wave Report** screen:

#### 3.5.1 Wave Report Contents

```
═══════════════════════════════════
         WAVE 5 COMPLETE
═══════════════════════════════════

  Score:           12,450
  Enemies Killed:  47
  Accuracy:        73%
  Max Combo:       23
  Graze Count:     18
  Perfect Waves:   2/5
  Bonus Stages:    2

  Current Loadout:
  ├─ Fire Rate:    ██░ (2/3)
  ├─ Damage:       █░░ (1/3)
  ├─ Spread Shot:  YES
  └─ Speed:        ░░░ (0/3)

  Active Synergies: None

       [ CONTINUE → ]
═══════════════════════════════════
```

#### 3.5.2 Purpose

- Creates natural **stopping points** where players feel accomplished
- Provides feedback loop on performance metrics
- Shows loadout progress for strategic awareness
- Encourages "just one more checkpoint" retention
- Mobile-friendly: clear session boundaries

#### 3.5.3 Timing

Reports appear at Waves 5, 10 (post-boss), 15, 20 (post-boss), and continue every 5 waves through loops.

On Loop 2+, the Wave 10 report (Wave 30, 50, 70...) follows the Overmind Fragment encounter.

Boss waves show an **extended report** with boss-specific stats (damage dealt, phases cleared, time to kill). Loop number is displayed prominently on all reports after Wave 20.

---

## 4. Enemy & Boss Design

### 4.1 Design Philosophy

Enemies in TCFU follow a clear design philosophy:

- **Silhouette Recognition**: Each enemy type has a distinct shape identifiable at a glance
- **Behavior Telegraphing**: Movement patterns should feel learnable and fair
- **Escalating Complexity**: New enemies introduce mechanics, not just higher stats
- **Color Coding**: Cool colors (cyan/blue) for all enemies to contrast warm player colors
- **Behavioral Distinctiveness**: Same-tier enemies must *feel* different, not just look different

### 4.2 Current Enemy: Klaed Scout

| Property | Value | Notes |
|----------|-------|-------|
| Sprite Size | 32x32px | Dark red base, cyan engine glow |
| Collision Box | 24x26px | Smaller than visual for forgiving gameplay |
| Movement | Vertical descent | Base velocity 100, scales with wave |
| Firing | Single shot | Starts Wave 3, 2-4s random cooldown |
| Points | 100 | Base score value |
| Powerup Drop | 15% | Weighted random selection |

**Behavioral Signature**: Predictable, steady descent. The "baseline" enemy that teaches fundamentals.

### 4.3 Planned Enemy Types

#### 4.3.1 Klaed Striker

A faster, more aggressive variant that prioritizes ramming attacks.

| Property | Value |
|----------|-------|
| Introduction Wave | 4 |
| Movement Pattern | **Swooping dive**: enters from side, curves toward player, exits opposite side |
| Behavior | No shooting; relies on collision damage |
| Speed | 1.5x base enemy velocity |
| Health | 1 hit |
| Points | 150 |
| Visual | Sleeker delta-wing silhouette, bright blue accents, motion blur trail |

**Behavioral Signature**: Enters horizontally, swoops in an arc toward player's *current* position (not predictive), then exits. Creates crossing threats that contrast with Scout's vertical descent.

**Design Intent**: Forces lateral movement and threat prioritization. Players must track horizontal threats while managing vertical ones.

#### 4.3.2 Klaed Bomber

Slow-moving enemy that creates area denial zones.

| Property | Value |
|----------|-------|
| Introduction Wave | 6 |
| Movement Pattern | **Horizontal passes**: enters from side, crosses screen slowly, exits opposite side |
| Behavior | Drops bombs at 2-second intervals |
| Bomb Mechanic | 1.5s fuse (flashing warning), 48px explosion radius, persists 0.5s |
| Health | 3 hits |
| Points | 250 |
| Visual | Wide, bulky frame with visible bomb bay underneath, yellow warning lights |

**Behavioral Signature**: Never descends vertically. Moves purely horizontally at the top third of the screen. Bombs fall straight down with clear visual/audio warning.

**Design Intent**: Creates dynamic safe zones. Players must track bomb positions while fighting other enemies. Horizontal-only movement is distinctly different from all other enemy types.

#### 4.3.3 Klaed Guardian

A defensive enemy that protects other units.

| Property | Value |
|----------|-------|
| Introduction Wave | 8 |
| Movement Pattern | **Stationary guardian**: descends to set Y position, then stops and holds |
| Behavior | Projects forward shield that blocks player projectiles |
| Shield Mechanic | Shield has 5 HP, regenerates after 3s if not destroyed |
| Own Health | 2 hits once shield is down |
| Points | 300 |
| Visual | Larger hexagonal body, visible shield generator dish, cyan shield effect |

**Behavioral Signature**: The only enemy that **stops moving** and holds position. Shield visibly flickers when taking damage. Breaking the shield causes a satisfying shatter effect.

**Design Intent**: Creates "puzzle" moments. Players must either focus fire to break shields, flank around them, or use Overcharge to pierce. Introduces target prioritization.

#### 4.3.4 Klaed Sniper

Long-range precision threat.

| Property | Value |
|----------|-------|
| Introduction Wave | 10 |
| Movement Pattern | **Stationary sniper**: spawns at fixed position at top of screen, never moves |
| Behavior | Charges for 1.5s, fires fast aimed shot at player's position |
| Warning | Visible red targeting laser during charge (locks onto player at fire moment) |
| Health | 2 hits |
| Points | 200 |
| Visual | Long, thin profile with oversized cannon, red targeting beam |

**Behavioral Signature**: Completely stationary. The laser warning is the key tell — when you see red, you have 1.5s to not be in that spot. Shot is fast but travels in straight line (dodge laterally).

**Design Intent**: Rewards observation and punishes tunnel vision. Players learn to scan the top of the screen. Creates tension during charge-up.

#### 4.3.5 Klaed Swarm

Chaotic micro-threats.

| Property | Value |
|----------|-------|
| Introduction Wave | 12 |
| Movement Pattern | **Erratic swarm**: semi-random zigzag paths, slight attraction toward player |
| Behavior | Spawns in groups of 8-12, no shooting |
| Health | 1 hit each |
| Points | 25 each |
| Visual | 16x16px, simple triangular shape, green tint, leaves brief trail |

**Behavioral Signature**: Chaotic and unpredictable, but individually non-threatening. The danger is volume. Swarms "feel" different from any other enemy due to their small size and erratic movement.

**Design Intent**: Tests spread shot value and rewards area control. Creates "bullet hell lite" moments. Provides satisfying multi-kill opportunities.

### 4.4 Enemy Behavioral Comparison

| Enemy | Movement Axis | Speed | Fires? | Unique Trait |
|-------|---------------|-------|--------|--------------|
| Scout | Vertical only | Slow | Yes | Predictable baseline |
| Striker | Diagonal arc | Fast | No | Crosses screen, swoops |
| Bomber | Horizontal only | Slow | Bombs | Area denial, never descends |
| Guardian | Vertical then stops | Slow | No | Stationary, has shield |
| Sniper | None (stationary) | None | Yes (charged) | Laser warning, aimed shot |
| Swarm | Erratic/random | Medium | No | Small, numerous, chaotic |

### 4.5 Boss Encounters

Bosses appear at milestone waves (10, 20, 30, etc.) and feature unique mechanics.

#### 4.5.1 Klaed Vanguard (Wave 10)

The first boss encounter, a massive command ship leading the initial invasion force.

| Property | Value |
|----------|-------|
| Size | 96x64px (3x enemy size) |
| Health | 50 hits |
| Phases | 2 distinct phases |
| Points | 5000 |
| Weak Point | Core (exposed during phase transition, 2x damage) |

**Phase 1 (100-50% HP):** Slow horizontal movement, fires 3-bullet spread patterns every 2 seconds.

**Phase Transition:** Boss stops, shield flickers, core exposed for 3 seconds. Player can deal double damage.

**Phase 2 (50-0% HP):** Faster horizontal movement, summons 2 Scouts every 10 seconds, adds aimed shots between spreads.

**Death Animation:** Explosions ripple across hull for 2 seconds, final large explosion, drops 3 powerups.

#### 4.5.2 Klaed Overlord (Wave 20)

A heavily armored battleship with multiple weapon systems.

| Property | Value |
|----------|-------|
| Size | 128x96px |
| Health | 100 hits (core) + 40 (turrets) |
| Phases | 3 phases |
| Points | 15000 |
| Turrets | 2 side turrets, 20 HP each, fire independently |

**Phase 1 — Turret Assault:** Side turrets fire crossing patterns. Main body is invulnerable until both turrets destroyed.

**Phase 2 — Beam Charge:** Main cannon charges for 3 seconds (visible energy buildup), fires massive beam down center. Safe zones at screen edges. Repeats 3 times.

**Phase 3 — Desperation:** Rapid fire from main cannon (no beam), summons Strikers every 8 seconds, moves faster. Core now vulnerable.

#### 4.5.3 Overmind Fragment — True Last Boss (Loop 2+)

A piece of the Klaed Overmind itself, featuring reality-warping abilities. **This boss only appears on Loop 2 and beyond** — a reward for players skilled enough to defeat the Overlord and continue into the endless war.

| Property | Value |
|----------|-------|
| Size | 160x160px (fills upper screen) |
| Health | 200 hits (scales with loop: +50 per loop) |
| Phases | 4 phases |
| Points | 50000 (×loop multiplier) |
| Appearance | Wave 30, 50, 70, 90... (every 20 waves after Wave 20, offset by 10) |

**True Last Boss Design**: The Overmind Fragment follows the shmup tradition of hidden bosses that reward mastery. Most players will never see it. Those who do have earned a brutal, spectacular fight.

**Unique Mechanics:**
- **Screen distortion**: Visual warping effects during certain attacks
- **Bullet reflection**: Phase 2 can reflect player bullets back
- **Temporal slow**: Phase 3 briefly slows player movement
- **Summon all**: Phase 4 summons every enemy type simultaneously

**Loop Scaling**: Each appearance adds new attack patterns. Loop 3+ Overmind gains a 5th phase with combined mechanics from all previous phases.

### 4.6 Enemy Introduction Schedule

| Wave | New Element | Cumulative Challenge | Difficulty Curve |
|------|-------------|---------------------|------------------|
| 1-2 | Klaed Scout (no firing) | Learn movement basics | ▂ Tutorial |
| 3 | Scouts begin firing | Dodge enemy projectiles | ▃ Rising |
| 4 | Klaed Striker | Prioritize ramming threats | ▄ Rising |
| 5 | Checkpoint | Wave Report screen | ▃ Breather |
| 6 | Klaed Bomber + Formations | Manage screen space | ▅ Rising |
| 7 | Mixed Scout/Striker/Bomber | Threat juggling | ▄ Breather |
| 8 | Klaed Guardian | Target prioritization | ▆ Rising |
| 9 | Pre-boss intensity | All types, high density | ▇ Peak |
| 10 | **BOSS: Vanguard** | First major test | █ Boss |
| 11 | Klaed Sniper introduced | Threat awareness | ▄ Post-boss ease |
| 12 | Klaed Swarm | Crowd control | ▅ Rising |
| 13-14 | Mixed elite waves | Full toolkit required | ▆ Rising |
| 15 | Checkpoint | Wave Report screen | ▅ Breather |
| 16-19 | Escalating intensity | All systems tested | ▆▇▇█ Building |
| 20 | **BOSS: Overlord** | Pattern mastery test | █ Boss |

**Difficulty Curve Philosophy**: Waves follow a non-linear pattern with intentional breather moments (waves 5, 7, 15) to prevent fatigue. Intensity builds to peaks before bosses, then eases afterward to reward victory.

---

## 5. Progression & Balancing

### 5.1 Wave System

TCFU uses a score-based wave progression system rather than time or kill-count thresholds.

#### 5.1.1 Current Implementation

| Parameter | Formula/Value | Notes |
|-----------|---------------|-------|
| Score to advance | 500 + (wave × 300) | Wave 1: 500, Wave 5: 2000 |
| Spawn rate | See 5.2 Difficulty Curve | Non-linear scaling |
| Enemy velocity | See 5.2 Difficulty Curve | Non-linear scaling |
| Formation spawn | Wave 6+ | 2x1, 3x1, 5x1 patterns |

### 5.2 Difficulty Curve (Non-Linear)

Instead of linear scaling, difficulty follows a wave pattern with peaks and valleys:

#### 5.2.1 Spawn Rate by Wave

| Wave | Spawn Interval | Notes |
|------|----------------|-------|
| 1-2 | 2500ms | Tutorial pace |
| 3-4 | 2000ms | Standard |
| 5 | 2200ms | Breather |
| 6 | 1800ms | Rising |
| 7 | 2000ms | Breather |
| 8 | 1600ms | Rising |
| 9 | 1400ms | Pre-boss peak |
| 10 | Boss only | No spawning |
| 11 | 1800ms | Post-boss ease |
| 12-14 | 1600ms → 1200ms | Gradual rise |
| 15 | 1400ms | Checkpoint breather |
| 16-19 | 1200ms → 800ms | Escalation |
| 20 | Boss only | No spawning |
| 21+ | 800ms (floor) | Maximum intensity |

#### 5.2.2 Enemy Velocity by Wave

| Wave | Base Velocity | Notes |
|------|---------------|-------|
| 1-5 | 100 | Learning speed |
| 6-10 | 120 | Moderate |
| 11-15 | 140 | Challenging |
| 16-20 | 160 | Demanding |
| 21+ | 180 (cap) | Maximum (prevents impossible) |

#### 5.2.3 Enemy Density Targets

| Wave Range | Target On-Screen | Notes |
|------------|------------------|-------|
| 1-3 | 2-4 enemies | Learning phase |
| 4-6 | 4-6 enemies | Comfortable pressure |
| 7 | 3-5 enemies | Intentional breather |
| 8-9 | 6-8 enemies | Pre-boss intensity |
| 10 | Boss + 0-2 summons | Boss focus |
| 11-14 | 5-8 enemies | Recovery then rise |
| 15 | 4-6 enemies | Checkpoint breather |
| 16-19 | 8-12 enemies | Expert challenge |
| 20 | Boss + summons | Boss focus |
| 21+ | 10-15 enemies | Overwhelming (by design) |

#### 5.2.4 Loop Scaling

After Wave 20, the game loops back to Wave 1's content with cumulative difficulty modifiers. Each loop applies the following scaling:

| Property | Per-Loop Modifier | Loop 2 Value | Loop 3 Value | Cap |
|----------|-------------------|--------------|--------------|-----|
| Enemy HP | +25% base | 1.25x | 1.5x | None |
| Enemy Velocity | +10% | 198 | 216 | 250 |
| Spawn Rate | -10% interval | 720ms floor | 648ms floor | 500ms |
| Enemy Fire Rate | -15% cooldown | 1.7-3.4s | 1.45-2.9s | 1.0-2.0s |
| Enemy Density | +2 target | 12-17 | 14-19 | 20 |

**Boss Scaling Per Loop:**

| Boss | Loop 2 | Loop 3+ |
|------|--------|---------|
| Vanguard | +25% HP, faster Phase 2 | +50% HP, summons Strikers instead of Scouts |
| Overlord | +25% HP, 3 turrets | +50% HP, beam fires twice per cycle |
| Overmind | Base stats | +50 HP per loop, new phase patterns |

**Design Reference**: See [ENDLESS_MODE_RESEARCH.md](ENDLESS_MODE_RESEARCH.md) for research on loop systems in classic arcade games (Galaga, Gradius) and modern implementations (Vampire Survivors, Nuclear Throne).

### 5.3 Powerup Economy

#### 5.3.1 Drop Rates

| Source | Chance | Notes |
|--------|--------|-------|
| Enemy death | 15% | Weighted by powerup type |
| Random spawn | Every 15 seconds | Guaranteed drops |
| Boss death | 100% (3 drops) | High-value guaranteed |
| Bonus Stage completion | 100% (1 drop) | Reward for perfect waves |
| Formation destruction | 25% | Bonus drop chance |

#### 5.3.2 Powerup Weights

Current weighted distribution (higher = more common):

| Powerup | Weight | Category |
|---------|--------|----------|
| Fire Rate Up | 20 | Permanent |
| Damage Up | 15 | Permanent |
| Speed Up | 15 | Permanent |
| Spread Shot | 10 | Permanent |
| Shield | 15 | Timed |
| Magnet | 10 | Timed |
| Score Multiplier | 5 | Timed |
| Invincibility | 5 | Timed |
| Extra Life | 3 | Instant |
| Bomb | 7 | Instant |

#### 5.3.3 Balancing Notes

- Permanent powerups are weighted higher to provide tangible progression
- Extra Life is rare to maintain tension
- Maxed-out powerups are excluded from drop pool
- Formation destruction adds 25% drop chance (encourages formation focus)
- Synergies make "suboptimal" pickups valuable

### 5.4 Player Survivability

#### 5.4.1 Current Settings

| Parameter | Value | Notes |
|-----------|-------|-------|
| Starting Lives | 3 | Can increase to max 9 |
| Starting Bombs | 1 | Can increase to max 3 |
| Invincibility after hit | 2.5 seconds | Extended from 2s for fairness |
| Player hitbox | 28x28px | Smaller than 32px sprite |
| Graze hitbox | 36x36px | For graze point detection |

#### 5.4.2 Shield Behavior

- Shield absorbs one hit without losing a life
- Shield absorb **does not break combo**
- Shield pulses/flashes at 2 seconds remaining (warning)
- Shield pulses faster at 1 second remaining (urgent warning)

---

## 6. Game Feel & Juice

This section specifies the "feel" elements that make TCFU satisfying to play. These details are critical — Vlambeer spent weeks on how a jet bounces off water.

### 6.1 Screen Effects

#### 6.1.1 Camera Shake

| Event | Intensity | Duration | Notes |
|-------|-----------|----------|-------|
| Player hit | Strong (8px) | 200ms | Communicates danger |
| Enemy destroyed | Light (2px) | 50ms | Satisfying feedback |
| Boss phase transition | Medium (5px) | 300ms | Dramatic moment |
| Boss death | Strong (10px) | 500ms | Victory emphasis |
| Bomb detonation | Strong (12px) | 400ms | Power fantasy |
| Overcharge fire | Medium (6px) | 150ms | Impactful release |

#### 6.1.2 Screen Flash

| Event | Color | Opacity | Duration |
|-------|-------|---------|----------|
| Player hit | Red | 30% | 100ms |
| Overcharge ready | White | 20% | 50ms pulse |
| Overcharge fire | White | 50% | 100ms |
| Boss death | White | 80% | 200ms |
| Bomb detonation | White | 60% | 150ms |
| Perfect Wave | Gold | 40% | 300ms |

#### 6.1.3 Slow Motion (Hit Stop)

| Event | Duration | Time Scale |
|-------|----------|------------|
| Boss phase transition | 300ms | 0.3x |
| Boss death | 500ms | 0.2x |
| Player death | 400ms | 0.2x |
| Synergy activation | 200ms | 0.5x |

### 6.2 Entity Feedback

#### 6.2.1 Player Ship

| Action | Visual Feedback | Audio Feedback |
|--------|-----------------|----------------|
| Moving | Engine thrust particles | Subtle thruster hum |
| Firing | Muzzle flash (1 frame) | "Pew" sound |
| Hit (with lives) | Flash white 3x, brief transparency | Impact + warning tone |
| Hit (death) | Explosion particle burst | Explosion + defeat sting |
| Overcharge charging | Glow intensifies, ship vibrates slightly | Rising hum pitch |
| Overcharge fire | Large muzzle flash, recoil animation | Powerful beam sound |
| Invincibility active | Rainbow shimmer effect | Subtle power hum |
| Shield active | Visible bubble around ship | Shield hum |
| Shield absorb | Shield shatters visually | Glass break + relief tone |

#### 6.2.2 Enemies

| Action | Visual Feedback | Audio Feedback |
|--------|-----------------|----------------|
| Spawn | Fade in over 200ms | Subtle whoosh |
| Hit (not killed) | Flash white 1 frame | Hit sound |
| Destroyed | Explosion particles (4-6 frame animation) | Explosion sound |
| Firing | Muzzle flash | Enemy fire sound |
| Guardian shield hit | Shield ripple effect | Energy impact |
| Guardian shield break | Shatter particle effect | Glass break |
| Sniper charging | Red laser appears, intensifies | Charging whine |
| Sniper firing | Bright muzzle flash | Loud crack |

#### 6.2.3 Projectiles

| Type | Visual | Trail Effect |
|------|--------|--------------|
| Player normal | 4x12px red | 2-frame trail |
| Player Overcharge | 12x36px white/red | Dramatic beam trail, screen-width glow |
| Enemy bullet | 4x8px orange | 1-frame trail |
| Sniper shot | 6x16px red | Long bright trail |
| Bomber bomb | 8x8px sphere | Flashing warning glow |
| Bomb explosion | 48px radius orange/red | Expanding ring |

### 6.3 UI Feedback

#### 6.3.1 Score Display

- **Point gain**: Numbers pop up at kill location, float upward, fade out
- **Combo multiplier**: Displayed next to score, pulses on increase
- **Milestone scores**: Brief flash effect (every 10,000 points)

#### 6.3.2 Announcements

| Event | Text | Style | Duration |
|-------|------|-------|----------|
| Wave start | "WAVE [N]" | 48px yellow, scale in | 1.5s |
| Perfect Wave | "PERFECT!" | 32px gold, sparkle effect | 1s |
| Formation Bonus | "FORMATION BONUS +[X]" | 24px white | 1s |
| Combo milestone | "COMBO x[N]" | 20px, color by tier | 0.5s |
| Synergy unlock | "SYNERGY: [Name]" | 28px purple, glow | 2s |
| Boss incoming | "WARNING" | 36px red, flash | 2s |
| Boss defeated | "BOSS DESTROYED" | 40px yellow | 2s |

#### 6.3.3 HUD Animations

- **Life lost**: Life icon shrinks and fades
- **Life gained**: Life icon pops in with scale bounce
- **Bomb used**: Bomb icon explodes into particles
- **Powerup collected**: Relevant HUD element pulses

### 6.4 Audio Design Guidelines

#### 6.4.1 Sound Effect Principles

- **Layered sounds**: Multiple elements per action (e.g., explosion = boom + debris + reverb)
- **Pitch variation**: ±10% random pitch on repeated sounds (prevents monotony)
- **Spatial audio**: Slight stereo positioning based on screen location
- **Priority system**: Player sounds > Enemy sounds > Ambient

#### 6.4.2 Music Guidelines

- **Adaptive intensity**: Music layers increase with wave difficulty
- **Boss music**: Distinct track, more intense
- **Victory stings**: Short musical phrases for achievements
- **Seamless loops**: No audible loop points

---

## 7. Future Features & Roadmap

### 7.1 Priority Tiers

#### Tier 1: Essential Polish (Before Release)

- [ ] Sound effects for all actions (shooting, explosions, powerups)
- [ ] Gameplay music loop with adaptive layers
- [ ] Explosion visual effects (particle system)
- [ ] Screen shake and hit flash implementation
- [ ] At least 2 additional enemy types (Striker, Bomber)
- [ ] One boss encounter (Wave 10 Vanguard)
- [ ] Combo system implementation
- [ ] Graze system implementation
- [ ] Formation bonus system
- [ ] Overcharge mechanic
- [ ] Wave Report checkpoints

#### Tier 2: High Value Additions

- [ ] Full enemy roster (all 5 planned types)
- [ ] Three boss encounters
- [ ] Object pooling for performance
- [ ] Powerup synergy system (all 8)
- [ ] Bonus Stage system
- [ ] Main menu music
- [ ] Tutorial/how-to-play screen
- [ ] Accuracy tracking and display

#### Tier 3: Future Expansion

- [ ] Additional game modes
- [ ] Leaderboards
- [ ] Player ship variants
- [ ] Achievement system
- [ ] Daily challenges

### 7.2 Game Modes

#### 7.2.1 Classic Mode (Current)

Endless waves with high score chasing via the 20-wave loop system. The core experience.

- **Loop 1** (Waves 1-20): Tutorial through Overlord. Two bosses.
- **Loop 2+** (Waves 21+): Scaled difficulty, Overmind Fragment appears every 20 waves.
- **Goal**: Survive as long as possible, maximize score through loops.

#### 7.2.2 Story Mode (Proposed)

Structured campaign with narrative beats:

- 20 waves with defined beginning and end
- Brief text interludes between key waves
- Ending cinematic upon completion
- Unlocks after first Wave 20 clear in Classic

#### 7.2.3 Boss Rush (Proposed)

Fight all bosses consecutively with limited resources:

- Start with 5 lives, 3 bombs
- No powerup drops between bosses
- One random powerup between each boss
- Score based on speed and remaining resources

#### 7.2.4 Daily Challenge (Proposed)

Daily seeded run with specific modifiers:

- Same seed for all players each day
- Modifiers: No powerups, double speed, one life, etc.
- Global leaderboard for daily scores
- Encourages daily engagement

### 7.3 Ship Variants

Future content could include unlockable ship variants:

| Ship | Unlock Condition | Unique Trait |
|------|------------------|--------------|
| XF-7 Defender | Default | Balanced stats |
| XF-8 Striker | Reach Wave 15 | Faster, less health, faster Overcharge |
| XF-6 Fortress | Reach Wave 20 | More health, slower, stronger Overcharge |
| XF-9 Prototype | Beat Boss Rush | Dual-fire, no Overcharge |

### 7.4 Technical Improvements

#### 7.4.1 Performance

- [ ] Implement object pooling for projectiles and effects
- [ ] Batch destroy operations for screen-clear bomb
- [ ] Optimize collision detection with spatial partitioning
- [ ] Profile and optimize mobile performance

#### 7.4.2 Quality of Life

- [ ] Settings menu (sound volume, control scheme, screen shake toggle)
- [ ] Keyboard rebinding
- [ ] Colorblind mode (alternative enemy/player colors)
- [ ] FPS counter (debug mode)
- [ ] Synergy discovery log in pause menu

### 7.5 Development Roadmap

| Phase | Deliverables |
|-------|--------------|
| Alpha Polish | SFX, music, juice effects, Overcharge, combo/graze systems |
| Alpha+ | 2 new enemies, formation bonus, Wave Reports |
| Beta Ready | All enemies, Wave 10 boss, synergies, bonus stages |
| Release Candidate | All 3 bosses, full polish pass, mobile testing |
| Post-Release | New modes, ships, events |

---

## 8. Design Decision Log

This section documents key design decisions and their rationale.

### 8.1 Score-Based Wave Progression

**Decision:** Waves advance based on accumulated score rather than time or kills.

**Rationale:** Rewards skilled play (faster progression) while keeping new players engaged. The 2X Score powerup becomes strategically valuable beyond just leaderboard positioning.

**Trade-off:** Players can potentially game the system by not collecting Score Multiplier to stay in easier waves longer.

### 8.2 Powerup Categories + Synergies

**Decision:** Three distinct powerup categories (Permanent, Instant, Timed) with a synergy system.

**Rationale:** Creates strategic depth. Permanent powerups provide progression within a run. Timed powerups create excitement and urgency. Instant powerups are pure value. Synergies make "weak" pickups valuable and reward experimentation.

**Trade-off:** More complex system to communicate to players. Discovery-based synergies may frustrate completionists.

### 8.3 Warm/Cool Color Coding

**Decision:** Player uses warm colors (white, red, orange), enemies use cool colors (cyan, blue, dark red).

**Rationale:** Instant visual differentiation during fast gameplay. Player bullets are always red, enemy bullets are always cool-colored. No confusion about threat sources.

**Trade-off:** Limits creative freedom in enemy design.

### 8.4 Smaller Hitboxes

**Decision:** Collision boxes are smaller than visual sprites (28px vs 32px for player).

**Rationale:** Creates forgiving gameplay that feels fair. Near-misses feel exciting rather than frustrating. Enables the graze system.

**Trade-off:** Visual inconsistency where bullets appear to pass through ships.

### 8.5 Mobile-First Resolution

**Decision:** 360x640 portrait canvas as base resolution.

**Rationale:** Optimized for mobile play while scaling well to desktop. Portrait orientation natural for vertical shooters.

**Trade-off:** Limited horizontal play space, desktop players have large black bars.

### 8.6 Non-Linear Difficulty Curve

**Decision:** Difficulty follows a wave pattern with peaks, valleys, and breather moments rather than linear scaling.

**Rationale:** Research shows non-linear curves prevent fatigue and create more engaging pacing. Breather waves (5, 7, 15) let players recover before intensity ramps. Matches arcade classics like Space Invaders where difficulty had natural ebb and flow.

**Trade-off:** More complex to balance. Some players may find breather waves "too easy."

### 8.7 Overcharge Risk/Reward System

**Decision:** Hold fire to charge a powerful piercing shot, but cannot fire normal shots while charging.

**Rationale:** Every great shooter has a signature risk/reward mechanic (Galaga's ship capture, Gradius's power meter). Overcharge creates tension and mastery moments. Rewards skilled timing without requiring complex capture mechanics.

**Trade-off:** Adds complexity to control scheme. May be underutilized by casual players.

### 8.8 Perfect Wave Bonus Stages

**Decision:** Perfect waves award stars; collecting 3 stars triggers a bonus stage with target drones.

**Rationale:** The accumulation mechanic (inspired by Super Mario Bros coin/star collection) makes every perfect wave meaningful, not just the one that triggers the bonus. Creates persistent tension ("I have 2 stars, don't mess up!") and rewards consistent skilled play over lucky single performances.

**Trade-off:** Delayed gratification may frustrate players expecting immediate reward. Requires clear UI to communicate star progress. Skilled players still get more bonus stages overall.

### 8.9 Combo and Graze Systems

**Decision:** Consecutive kills build combo multiplier; near-misses award graze points.

**Rationale:** Industry standard for score depth (1942, bullet hell games). Combo rewards aggressive play. Graze rewards skilled positioning and makes near-misses exciting rather than stressful.

**Trade-off:** Experienced players will score dramatically higher, making leaderboards feel inaccessible to newcomers.

### 8.10 Session Checkpoints (Wave Reports)

**Decision:** Display detailed stats every 5 waves with a brief pause.

**Rationale:** Mobile games need clear stopping points. Reports create sense of accomplishment. Feedback loop on performance metrics helps players improve. Natural session boundaries support "just one more checkpoint" retention.

**Trade-off:** Interrupts flow for players in "the zone." Some may find reports annoying.

### 8.11 20-Wave Loop System

**Decision:** The game uses a 20-wave loop structure. After defeating the Overlord at Wave 20, players loop back to Wave 1 content with scaled difficulty. The Overmind Fragment appears only on Loop 2+ as a True Last Boss.

**Rationale:** Research into classic arcade shooters (Galaga, Gradius, Space Invaders) and modern endless modes (Vampire Survivors, Brotato, Nuclear Throne) showed that looping with difficulty scaling is the standard approach. This maximizes content reuse while providing infinite progression. The 20-wave loop creates tighter pacing than a 30-wave loop, supporting the "one more run" pillar. Making the Overmind a True Last Boss creates an aspirational goal — seeing it becomes an achievement in itself.

**Trade-off:** Content becomes repetitive after multiple loops. Mitigated by cumulative difficulty modifiers that change how encounters play out. Boss enhancements per loop add variety.

**Reference:** See [ENDLESS_MODE_RESEARCH.md](ENDLESS_MODE_RESEARCH.md) for full research and alternative approaches considered.

### 8.12 Resolved Questions

Previously open questions, now decided:

- **Bombs auto-trigger on death?** → No. Resource management is part of the skill expression.
- **Dynamic powerup weighting?** → No. Pure randomness with synergies provides enough variety without rubber-banding.
- **Difficulty settings?** → Deferred to post-release. Single difficulty preserves unified leaderboard.
- **Continue system?** → No. High score purity maintained. Game over is game over.
