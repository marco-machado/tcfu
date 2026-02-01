# Endless Mode Design Research

## The Core Problem

TCFU's Game Design Document describes "Classic Mode" as "Endless waves with high score chasing," but the content design contradicts this:

- **Detailed content through Wave 20**: Enemy introductions, difficulty curves, narrative arc
- **Three unique bosses**: Wave 10, 20, and 30 only
- **Difficulty caps at Wave 21+**: 800ms spawn floor, 180 velocity cap
- **No content defined for Wave 31+**: What happens after the Overmind Fragment?

The document attempts to be both a structured campaign AND an endless arcade mode without reconciling them.

---

## Classic Arcade Approaches

### Space Invaders: The Original Endless Loop

[Space Invaders](https://en.wikipedia.org/wiki/Space_Invaders) established the template:

- First video game with endless gameplay
- Each cleared wave brings another that **starts lower on screen**
- Enemy speed increases as fewer remain (Difficulty by Acceleration)
- Simple loop: same enemies, incrementally harder positioning

**Key Insight**: The "loop" isn't about new content—it's about *geometric pressure* (enemies start closer to you).

### Galaga: Same Enemies, Escalating Aggression

[Galaga](https://en.wikipedia.org/wiki/Galaga) built on this:

- Enemies become **more aggressive** as the game progresses
- Increase projectile count and dive frequency
- No new enemy types—just behavioral escalation
- Technical limit: Stage 255 caused bugs (8-bit overflow)

**Key Insight**: Endless doesn't require new content if existing enemies have **tunable aggression parameters**.

### Gradius Series: The "Loop" System

From the [Shmups Wiki glossary](https://shmups.wiki/library/Help:Glossary):

> "Many shooters loop back to the first stage with increased difficulty."

The loop (or "2-ALL") is a shmup tradition:
- Beat the game → start over at Stage 1 with harder parameters
- DoDonPachi: Beating both loops = "2-ALL"
- True Last Bosses only appear on Loop 2+ or with special conditions

**Key Insight**: Loops reuse all content but with **global difficulty multipliers** applied.

---

## Modern Loop Systems

### Nuclear Throne: Chaos Loops

[Nuclear Throne's loop system](https://steamcommunity.com/app/311690/discussions/0/3570700856123485936/):

- After the "final" boss, you return to Level 1 with all upgrades
- World becomes "more chaotic" with new bosses and weapons
- Loop 2+ adds "more unfair than hard difficulty"
- Criticized for "ham-handed difficulty scaling" and instant-death spawns

**Key Insight**: Loops can add content (new bosses) but risk frustration if scaling is too aggressive.

### Vampire Survivors: Cycle-Based Scaling

[Vampire Survivors Endless Mode](https://vampire-survivors.fandom.com/wiki/Stages):

Every cycle (completing the stage timer) applies:
- Enemies: **+100% base HP**
- Spawn frequency/quantity: **+50%**
- Enemy damage: **+25%**
- Player max incoming damage cap: **-1**

Player gets:
- Limit-breaking weapon upgrades
- Merchant respawns with extra Revivals
- Additional Arcana options

**Key Insight**: Clear percentage-based scaling per cycle creates predictable but exponential difficulty. Player scaling must match.

### Brotato: Elite Stacking

[Brotato Endless Mode](https://brotato.wiki.spellsandguns.com/Endless_Mode):

- Every 10th wave (30, 40, 50...) = both bosses appear
- **+1 Elite added** to Elite/Boss waves per 10 waves
- "Endless Factor" multiplier increases exponentially

**Key Insight**: Adding MORE enemies (elites, bosses) rather than just stat buffs creates escalating chaos.

---

## Difficulty Modifier Systems

### Hades: Pact of Punishment (Modular Heat)

[Hades Heat System](https://hades.fandom.com/wiki/Pact_of_Punishment):

**14 modifiers** with individual ranks:
- Hard Labor: Enemies deal more damage
- Lasting Consequences: Reduced healing
- Jury Summons: More enemies spawn
- Tight Deadline: Time limits added
- Etc.

**Design Philosophy**:
> "The question is, which of these are more tolerable for you? The answer varies from player to player and from build to build."

**Key Insights**:
1. Players **choose** their difficulty composition
2. Modifiers interact—combining Hard Labor + Jury Summons is worse than either alone
3. Per-weapon progression creates replayability
4. Heat 16 and Heat 32 as milestone thresholds

### Slay the Spire: Cumulative Ascension

[Slay the Spire Ascension](https://slay-the-spire.fandom.com/wiki/Ascension):

**20 Ascension levels**, each adding ONE new modifier:
- A1: Elites are stronger
- A2: Normal enemies are stronger
- A10: Elites can appear on Floor 1
- A17: Bosses are stronger
- A20: Curses at start, less money

**Key Insights**:
1. **Cumulative** modifiers (A10 includes A1-A9 effects)
2. Incremental difficulty prevents bouncing off "hard mode"
3. Forces players to re-evaluate strategies that worked before
4. Per-character progression

---

## Endless Mode Specific Patterns

### The "Endless Factor" Pattern

From [academic research on endless mobile games](https://www.diva-portal.org/smash/get/diva2:1479905/FULLTEXT01.pdf):

- "Quick progressive difficulty" is common
- Sessions typically 20 seconds to a few minutes
- Player attempts to score as many points as possible until defeat

**TCFU Relevance**: Wave Reports every 5 waves already create session boundaries.

### Mutator Systems

[Roboquest's Endless Mode](https://www.starbreeze.com/news/celebrate-roboquests-first-anniversary-with-the-endless-update-a-major-new-update-to-the-fast-paced-roguelite-shooter/):

- Each level adds a **Singularity** (major modifier) or **Glitch** (minor modifier)
- Duo-Boss fights every 3 levels
- Random modifier combinations create run variety

**Problems Identified**:
- Some boss combos trivial, others instant-death
- Random modifiers can "make or break" early levels

**Key Insight**: Modular mutators add variety but need balance guardrails.

### Procedural Difficulty Relaxation

From [Sure Footing's procedural generation](https://www.gamedeveloper.com/design/keep-running-procedural-level-generation-in-sure-footing):

> "Constraints are gradually relaxed during play, allowing more difficult content."

The generator:
1. Starts with tight constraints
2. Relaxes them over time
3. Injects variety through mutator swaps

**Key Insight**: Difficulty can be controlled by **relaxing generation constraints** rather than just stat buffs.

---

## Boss Handling in Endless Modes

### TV Tropes Observation

From [Endless Game](https://tvtropes.org/pmwiki/pmwiki.php/Main/EndlessGame):

> "If there are enemies to destroy, don't expect any boss fight, since there can only be a limited number of bosses, and these games never end."

This is the traditional view—but modern games have found solutions.

### Boss Recycling Approaches

| Game | Approach | Notes |
|------|----------|-------|
| **Brotato** | Both bosses every 10 waves | Predictable, fair |
| **Roboquest** | Duo-boss pool, random pairs | Creates variety but can be unfair |
| **Nuclear Throne** | New bosses on Loop 2+ | Rewards mastery with new content |
| **Vampire Survivors** | No traditional bosses | Scales enemy density instead |

### Warning Forever: Adaptive Bosses

[Warning Forever](https://www.gamedeveloper.com/design/video-game-boss-design-for-shmups):

> "The player faces an unending stream of bosses that attempt to adapt to the player's attacking style by changing their designs."

- Boss is modular—collection of components
- Adds armor where player attacks from
- Creates infinite variety from one "boss framework"

**Key Insight**: Procedural/adaptive bosses solve the "limited boss" problem.

### True Last Boss (TLB) Pattern

From [Shmups Wiki](https://shmups.wiki/library/Help:Glossary):

> "A hidden boss that only appears to highly skilled players."

Requirements can include:
- No-miss, no-bomb run
- Score threshold
- Higher difficulty mode
- No continues used

**Key Insight**: Hidden bosses reward mastery without cluttering normal progression.

---

## Recommendations for TCFU

### Option A: "Structured Endless" (Looping)

**Concept**: The game "loops" after Wave 20 or 30, replaying all content with scaling modifiers.

**Implementation**:
- Wave 21-40 = Loop 2 (Wave 1-20 content + modifiers)
- Wave 41-60 = Loop 3 (more modifiers)
- Each loop adds: +25% enemy HP, +10% velocity, new behavior patterns

**Bosses**:
- Wave 10/20/30 bosses repeat at 40/50/60 with enhanced patterns
- Loop 2+ bosses gain new attack phases

**Pros**: Maximizes existing content, clear progression
**Cons**: Feels repetitive, needs enhanced boss patterns per loop

---

### Option B: "Pure Endless" (Post-Campaign)

**Concept**: Separate the structured campaign (Waves 1-30) from endless mode.

**Implementation**:
- "Story Mode" = Waves 1-30, ends with Overmind Fragment
- "Endless Mode" unlocks after completing Story Mode
- Endless Mode starts at maximum difficulty, pure survival

**Bosses**:
- No bosses in Endless Mode
- OR: Random boss every 10 waves from the existing pool

**Pros**: Clear separation of experiences, story has an ending
**Cons**: Two modes to balance, reduces endless mode content

---

### Option C: "Ascending Heat" System

**Concept**: Apply Hades-style modular difficulty after Wave 20.

**Implementation**:
- Waves 1-20 = Fixed difficulty curve (as designed)
- Wave 21+: Each wave adds a random modifier from a pool:
  - "Swarm Protocol": +2 enemies per spawn
  - "Velocity Surge": +5% enemy speed
  - "Barrage Mode": -0.2s enemy fire cooldown
  - "Shield Matrix": Guardians appear more frequently
  - "Elite Wave": All enemies have +1 HP

**Bosses**:
- Bosses every 10 waves, cycling through the three
- Each boss gains +1 modifier per appearance

**Pros**: Infinite variety, player adapts to combinations
**Cons**: Can become unfair with bad modifier stacking

---

### Option D: "Milestone Loops with New Content"

**Concept**: Major milestones introduce new mechanics/bosses.

**Implementation**:
- Wave 30: Overmind Fragment (as designed)
- Wave 40: **Klaed Harbinger** (new boss, uses all enemy abilities)
- Wave 50: **Dual Boss** (Vanguard + Overlord simultaneously)
- Wave 60+: Procedurally combined bosses

**Between Bosses**:
- Stat scaling: +10% HP, +5% velocity per 10 waves
- New enemy behavior patterns unlock (e.g., Scouts gain homing at Wave 35)

**Pros**: Meaningful content at milestones, clear goals
**Cons**: Requires designing more bosses, finite content problem returns

---

### Option E: Hybrid "Campaign + Endless Continuation"

**Concept**: Campaign content through Wave 30, then transitions to pure endless with mechanics shift.

**Implementation**:
- Waves 1-30: As designed (narrative arc, boss encounters)
- Wave 31+: "Endless War" mode with different rules:
  - No more bosses
  - Enemies spawn in pure chaos (all types mixed)
  - Wave timer introduced (survive 60s = wave complete)
  - Difficulty modifiers accumulate every 5 waves
  - Score multiplier increases with wave number

**Pros**: Clear narrative conclusion + infinite play, mechanics feel fresh post-30
**Cons**: Jarring mode transition, may feel like two games

---

## Summary Comparison

| Approach | Content Reuse | Boss Handling | Complexity | Fits Arcade Feel |
|----------|---------------|---------------|------------|------------------|
| A: Looping | High | Recycled + enhanced | Medium | ★★★★★ |
| B: Separate Modes | None | Story-only or random | Low | ★★★☆☆ |
| C: Ascending Heat | Medium | Cycling + modifiers | High | ★★★★☆ |
| D: Milestone Content | Low | New designs needed | Very High | ★★★★☆ |
| E: Hybrid | Medium | Story bosses + none | Medium | ★★★☆☆ |

---

## Key Takeaways

1. **Classic arcades solved this with loops**: Same content, scaled difficulty
2. **Modern games use modular modifiers**: Hades Heat, StS Ascension
3. **Boss recycling is standard**: Brotato, Roboquest, Nuclear Throne all do it
4. **"Endless Factor" multipliers** work if player power scales too
5. **Breather moments matter**: Non-linear difficulty prevents fatigue
6. **True Last Bosses** reward mastery without cluttering main game

---

## Sources

### Classic Arcade Design
- [Space Invaders - Wikipedia](https://en.wikipedia.org/wiki/Space_Invaders)
- [Galaga - Wikipedia](https://en.wikipedia.org/wiki/Galaga)
- [Shmups Wiki Glossary](https://shmups.wiki/library/Help:Glossary)
- [Video Game Boss Design For Shmups](https://www.gamedeveloper.com/design/video-game-boss-design-for-shmups)

### Modern Loop Systems
- [Nuclear Throne Discussion](https://steamcommunity.com/app/311690/discussions/0/3570700856123485936/)
- [Vampire Survivors Stages Wiki](https://vampire-survivors.fandom.com/wiki/Stages)
- [Brotato Endless Mode Wiki](https://brotato.wiki.spellsandguns.com/Endless_Mode)

### Difficulty Modifier Systems
- [Hades Pact of Punishment Wiki](https://hades.fandom.com/wiki/Pact_of_Punishment)
- [Hades Pact of Punishment Guide - RPG Site](https://www.rpgsite.net/feature/10287-hades-pact-of-punishment-heat-modifiers-and-how-to-maximize-your-rewards)
- [Slay the Spire Ascension Wiki](https://slay-the-spire.fandom.com/wiki/Ascension)
- [More Games Should Handle Difficulty Like Slay the Spire](https://frostilyte.ca/2020/04/16/more-games-should-handle-difficulty-like-slay-the-spire/)

### Endless Mode Design
- [Roboquest Endless Update](https://www.starbreeze.com/news/celebrate-roboquests-first-anniversary-with-the-endless-update-a-major-new-update-to-the-fast-paced-roguelite-shooter/)
- [Endless Game - TV Tropes](https://tvtropes.org/pmwiki/pmwiki.php/Main/EndlessGame)
- [Game Design Patterns in Endless Mobile Minigames (PDF)](https://www.diva-portal.org/smash/get/diva2:1479905/FULLTEXT01.pdf)
- [Procedural Level Generation in Sure Footing](https://www.gamedeveloper.com/design/keep-running-procedural-level-generation-in-sure-footing)
