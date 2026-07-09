# First playable loop

Status: `ready-for-agent`

## Problem Statement

The project has a design package and a scaffolded app (4:3 shell screens, Hangar, fixed-timestep sim, movement band, input sampling, placeholder ship mesh, persist helpers), but a player cannot yet complete a full arcade session. There is no combat, no threats, no damage or death, no scoring that matters, and no path from Run to Results with a real run summary. Until that vertical slice works, the design cannot be felt or validated in play.

## Solution

Deliver the first playable **endless survival** loop end to end:

**Title → Hangar → Launch → Run (move, fire, bomb, take hits, clear waves, die) → Results → Quick retry or Hangar.**

The Run must be a real short arcade session: the player flies the **Vanguard** kit inside the **movement band**, shoots fodder/grunt threats driven by the **world stream** and intro **wave patterns**, loses HP and lives under combat rules, and on final death sees Results with score, wave, kills, time, and Scrap earned. Placeholder meshes and minimal catalogs are fine; the loop must be authoritative in the **sim**, with shell and view only reflecting sim state.

## User Stories

1. As a player, I want to start from Title, open Hangar, pick the unlocked starter ship kit, and Launch, so that I can begin a Run without fighting missing systems.
2. As a player, I want my ship to move with four-way controls inside the movement band only, so that classic vertical shmup positioning feels constrained and readable.
3. As a player, I want hold-to-fire to shoot fixed +Y bullets from my kit weapon, so that I can destroy threats.
4. As a player, I want bomb input (edge-triggered) to spend bomb stock when available, so that I can clear pressure in a panic.
5. As a player, I want empty bomb stock to ignore bomb input, so that the control does not false-trigger effects.
6. As a player, I want enemies to spawn according to wave patterns and stream toward me along the corridor, so that the playfield feels like an endless survival corridor.
7. As a player, I want intro waves to teach move/shoot and dodge before denser pressure, so that the first minutes are learnable.
8. As a player, I want a wave index that increments endlessly on the HUD, so that I can track how far I got.
9. As a player, I want a short gap between waves while the world stream continues, so that rhythm stays arcade-like without full stops.
10. As a player, I want my bullets to damage and kill enemies, so that combat has agency.
11. As a player, I want enemy contact and enemy bullets to damage me, so that survival has stakes.
12. As a player, I want no ram-kill of enemies on contact, so that body-blocking is not an exploit.
13. As a player, I want standard hits to deal 1 HP and cataloged heavy hits to deal 2 HP, so that threat weight matches design.
14. As a player, I want at most one player damage instance per sim step (highest wins), so that overlapping hits do not unfairly melt HP in one frame.
15. As a player, I want a shield buffer of one hit when present, so that I can absorb a mistake.
16. As a player, I want i-frames after damage, after respawn, and after shield absorb, so that death spirals from multi-hit frames feel fair.
17. As a player, I want to still move, fire, and (when implemented later) collect during i-frames, so that recovery is active, not frozen.
18. As a player, I want HP reaching 0 to cost a life and respawn me at band center with invulnerability and nearby enemy-bullet mercy clear when lives remain, so that multi-life runs match the design.
19. As a player, I want lives reaching 0 to end the Run and go to Results, so that the session has a clear terminal state.
20. As a player, I want no continues mid-run, so that death is final for that session.
21. As a player, I want score from kills (base points × wave multiplier) and wave-clear bonuses when applicable, so that performance is rewarded without passive time score.
22. As a player, I want the wave multiplier to follow the design formula and cap, so that late-run score scales predictably.
23. As a player, I want the HUD to show score, wave, lives, HP, shield, bombs, and pause state, so that I can read the run without leaving the playfield.
24. As a player, I want pause to freeze the sim and resume to continue from the same state, so that I can step away without cheating the clock unfairly.
25. As a player, I want focus loss to auto-pause the Run, so that alt-tab does not silently kill me.
26. As a player, I want Run elapsed time to exclude pause, so that Results time survived matches active play.
27. As a player, I want Results to show score, wave reached, kills, time survived, ship kit, and Scrap earned, so that the session is summarized.
28. As a player, I want Scrap granted at Results from the design formula, so that meta currency starts flowing even if the upgrade bay UI is minimal.
29. As a player, I want qualifying scores written to the local top-10 high scores, so that I can chase personal bests offline.
30. As a player, I want Quick retry on Results to start a new Run with the same ship kit, so that arcade retry is one click.
31. As a player, I want to return to Hangar or Title from Results, so that I can leave the retry loop.
32. As a player, I want keyboard and gamepad controls from the design defaults to work for move, fire, bomb, and pause, so that either device can complete the loop.
33. As a player, I want bullets and enemies culled when they leave the play corridor bounds, so that the sim stays bounded.
34. As a player, I want player bullets not to collide with enemy bullets, so that the bullet layer rules stay readable and performant.
35. As a player, I want the Vanguard kit stats (HP, bombs, hitbox, pulse cannon tier 0) as the default playable ship for this slice, so that the starter fantasy is complete.
36. As a player, I want locked ships to remain non-launchable until score unlocks (even if unlock evaluation is light), so that Hangar already respects score milestones.
37. As a player, I want enemy despawn or death to stop them dealing damage, so that dead threats do not ghost-hit.
38. As a player, I want bomb to clear enemy bullets on the playfield, damage on-screen enemies, grant short i-frames, and score kills normally, so that bomb matches combat design.
39. As a player, I want world stream speed to use the base rate with mild wave ramp and cap, so that pressure escalates with waves.
40. As a player, I want placeholder visuals for ship, bullets, and enemies in 3D, so that the loop is watchable without production art.
41. As a player, I want the sim (not the view) to own positions, HP, score, waves, and collisions, so that behavior is deterministic under fixed timestep.
42. As a developer/player, I want the first slice to be completable without meta-upgrade purchases, powerup full system, W-cell tiers, or set-piece bosses, so that shippable scope stays a single vertical slice.
43. As a player, I want off-screen spawn approach and on-stream motion for threats, so that enemies enter from ahead rather than popping into the band.
44. As a player, I want integer score display, so that the arcade number is clean.
45. As a player, I want respawn to keep enemies on the field (only clear nearby enemy bullets), so that life loss is not a full-screen wipe beyond bomb/mercy rules.
46. As a player, I want firing rate and bullet speed to follow pulse_cannon tier 0 defaults for Vanguard, so that starter DPS is known.
47. As a player, I want at least drones (and preferably darts/gunners as intro patterns need) so intro waves are playable as designed.
48. As a player, I want wave clear bonus when all wave enemies die before the design timeout after last spawn, so that aggressive clears are rewarded.
49. As a player, I want no passive HP regen, so that repair/powerups (later) remain meaningful and the slice stays honest.
50. As a player, I want run state fully reset on Launch and Quick retry, so that leftover bullets/enemies/score never leak between runs.

## Implementation Decisions

### Scope of the first playable loop

- Implement the closed screen flow: Title → Hangar → Run → Results → Hangar / Quick retry / Title / High Scores.
- Run is playable combat, not movement-only scaffold.
- Content minimum for “playable”:
  - Ship: **Vanguard** fully functional in combat (other kits may remain select-locked or use stub stats if already scaffolded; combat correctness priority is Vanguard).
  - Weapon: **pulse_cannon** at tier 0 (single center shot); higher tiers / W-cells optional stretch, not required to close the loop.
  - Enemies: at least catalog ids needed for **intro_01–intro_03** (drone, dart, gunner). Other enemy types may be deferred.
  - Waves: fixed intro sequence, then a minimal endless fallback (e.g. recycle easy drone/dart patterns with wave index scaling) so the run never soft-locks after intro.
  - Powerups, full 24-pattern catalog, elites, set-pieces, meta upgrade bay UI: **out of scope** unless already trivial stubs.
- Art: primitive/placeholder meshes and materials OK; hi-fi PBR pipeline not required for this PRD.

### Architecture (respect existing design)

- Keep the three-layer split: **sim** (authority), **view** (R3F presentation), **shell** (DOM screens + HUD).
- Fixed timestep **1/60** with accumulator and max steps per frame (already scaffolded); all combat and collision only on sim steps.
- Mutable world + entity pools in sim; do not drive entity motion via React `setState` in `useFrame`.
- Input devices sample to **Commands**; sim consumes Commands only.
- Simple 2D XY collision (existing circle/AABB helpers); no rigid-body physics engine for gameplay.
- When stack behavior is locked in code, an ADR for fixed-timestep sim + R3F-as-view + 2D collision may be added under `docs/adr/` (design already nominates this); not a blocker for the slice if behavior matches DESIGN.

### Sim world model

- Extend the world so a Run can be fully represented without React:
  - Player (position, velocity, HP, lives, bombs, shield, i-frames, ship kit id, fire cooldown, etc.)
  - Session (score, wave index, kills, elapsed active time, paused, **runOver** or equivalent terminal flag)
  - Entity pools: player bullets, enemy bullets, enemies (active flags, hp, hitbox, points, path, timers)
  - Wave director state: current pattern id/index, spawn cursor/time, gap timer, clear-bonus window
  - Stream speed derived from base and wave index per design
- `createWorld` / `resetWorld` fully resets all pools and session fields for a clean Launch/retry.
- Terminal condition: when lives would drop below 1 (or HP→0 with lives already 0 after consume), set run over; shell observes and transitions to Results once (do not double-fire end).

### Combat rules (binding numbers from design)

- Lives: **3** per run; HP per life from kit (Vanguard **3**).
- Damage: standard **1**, heavy **2** when catalog marks it; one player damage event per step, highest wins → shield absorb → HP → life.
- I-frames: **1.0 s** after HP damage; **2.0 s** after respawn; **0.5 s** after shield absorb.
- Respawn: band center default position; mercy clear enemy bullets within **r = 3**; enemies remain.
- Bomb: start **2**, max **5** for Vanguard; edge-triggered; effect clears enemy bullets on playfield, **5** damage to on-screen enemies, **0.75 s** i-frames; kills score normally; empty stock ignores input.
- Layers: player hurtbox vs enemy body / enemy bullet / hazard; player bullet vs enemy body; no player-bullet vs enemy-bullet; no friendly fire; no ram-kill.
- Default radii: player hitbox from kit (**0.35** Vanguard); player bullet **0.12**; enemy bullet **0.15**; enemy radii from catalog.
- Cull: spawn approach ~**y = 18**; despawn **y < -2** or **|x| > 10** (and similar for bullets leaving useful space).

### Movement and fire

- Movement band, accel/decel, max speed, clamp-on-hitbox-center: already scaffolded; keep design constants.
- Hold fire: while `fire` command true and cooldown ready, spawn player bullet(s) per weapon row.
- Fixed fire direction **+Y**; no mouse aim.

### Waves and difficulty (minimum)

- Wave = scheduled pattern (or short chain) completing its spawn window; HUD wave index `1, 2, 3, …`.
- Gap ~**0.75 s** between waves; stream never fully stops.
- Implement intro patterns at least as specified in the wave-pattern catalog (macros may be expanded inline to spawn events).
- After intro, endless continuation with simple authored or repeated easy patterns is required so play continues until death.
- Difficulty multipliers by wave index from design (HP, shot speed, fire cooldown, stream) applied to active enemies/spawns; full late-game content not required.
- Wave clear bonus if all wave enemies dead before **8 s** after last spawn; else timeout without that bonus.
- Scoring: kill = enemy base points × wave multiplier `1 + 0.05 × (waveIndex - 1)`, cap **3.0**; wave clear flat bonus with light scale; no survival tick score; no score loss on death. Integer display.

### Shell / session wiring (supporting, not the test seam)

- `startRun`: reset world for selected ship, screen = run.
- While run over becomes true: build summary (score, wave, kills, timeSec, shipId, scrapEarned), grant Scrap into meta persist, try high score insert, call `endRun`, show Results.
- Scrap formula at Results: `floor(score / 100) + floor(wavesCompleted × 5)` (Salvage rank bonus may be **0** in this slice if meta ranks are unused).
- Pause: command toggles `session.paused`; window blur auto-pauses while on Run.
- HUD continues to read world each frame for display only.
- Results actions: Quick retry (`startRun`), Hangar, High Scores, Title.

### View

- Sync player, bullets, enemies from sim each frame (refs / instancing preferred for many bullets).
- Placeholder geometry acceptable; readability colors: cyan-ish player, warm enemies, distinct bullets.
- Camera stays design-locked (fixed corridor view); cosmetic sway optional for this slice.

### Modules to build or deepen

- **Sim**: world types/pools, step pipeline (move player, fire, bomb, stream/paths, spawn waves, move bullets/enemies, collide, damage/respawn, score, timers, terminal), constants from design, thin catalog tables for intro enemies/weapons/patterns.
- **View**: render new entity types; keep SimDriver as fixed-step host that samples input and steps world; detect run over and notify session once.
- **Shell**: Results real data path; pause overlay already present; optional quit-to-hangar can stay minimal.
- **Persist**: use existing high score and meta Scrap writers from Results path; no schema redesign required for the slice.
- **Input**: existing Commands sufficient if fire/bomb/pause/move already mapped.

### Explicit non-goals inside implementation

- Do not introduce a full physics engine.
- Do not put combat authority in React components.
- Do not block the slice on production GLBs, audio music direction, rebinding UI, or full meta tree UX.

## Testing Decisions

### What makes a good test

- Test **external behavior of the sim world** only: given a world setup and a sequence of `(dt, Commands)` (or repeated steps), assert observable world fields (positions clamped, entities spawned/despawned, HP/lives, i-frames, score, wave index, run over, bomb stock, shield, kill counts).
- Do **not** assert React trees, R3F scene graphs, CSS, or localStorage unless a separate non-goal test appears later; this PRD’s seam is sim-only.
- Do **not** assert private helper names, pool slot indices, or intermediate “system order” except where order is user-visible (e.g. one damage event per step, shield before HP).
- Prefer deterministic pure setups: construct world, poke entities if needed via public factory/spawn test helpers exposed for tests, step, assert.
- Use fixed `dt` of the real fixed step for combat fairness cases.

### Primary seam

- **Sim world step** (the deepened `stepWorld` / world API): sole test seam for this feature.
- Shell transition, view meshes, and input device sampling are out of automated scope for this PRD (manual play smoke is enough for those adapters).

### What to cover at the seam (representative cases)

- Movement band clamp and wall velocity zeroing under sustained move commands.
- Hold fire spawns bullets on cooldown; release stops new spawns.
- Player bullet hits reduce enemy HP and grant score on kill; dead enemies no longer collide.
- Enemy bullet or contact damages player; i-frames prevent immediate re-hit; shield absorbs one hit when set.
- One-step multi-overlap resolves to a single player damage instance.
- HP→0 with lives remaining: life dec, respawn position, i-frames, mercy bullet clear radius behavior.
- Lives exhausted: run over true; further steps do not continue a normal combat session (or no-op safely).
- Bomb spends stock, damages on-screen enemies, clears enemy bullets, grants i-frames; bomb at 0 is no-op.
- Wave director advances intro spawns; wave index increments after pattern completion + gap.
- Wave multiplier applied to kill score; integer/flooring rules as designed.
- Pause freezes sim progression (elapsed, spawns, motion) while paused flag set.
- Full reset between runs leaves no live entities or leftover score.

### Modules under test

- Sim world factory/reset and step pipeline (including collision outcomes as observed on world entities).
- Existing pure collision helpers may be used indirectly; no requirement to re-test them in isolation unless convenient.

### Prior art

- No automated test runner is established in the repo yet. Add the lightest project-consistent harness needed to unit-test pure sim modules (e.g. Vitest or equivalent already common for Vite TS apps), colocated or under a `sim` test folder. Do not build a browser E2E suite for this PRD.

## Out of Scope

- Mobile / touch, non-4:3 responsive layouts
- Multiplayer, accounts, cloud saves, online leaderboards
- Full rigid-body physics
- Full procedural level geometry as primary content
- Campaign / mission select
- Free-form loadout crafting
- Input rebinding UI
- Full four-ship combat polish and all weapon lines/tiers
- W-cell run upgrades and powerup spawn economy (may stub zero drops)
- Meta upgrade bay spend UI and rank effect stacking (Scrap may still accrue)
- Full 24 wave patterns, elites, set-piece bosses, boss HUD
- Hi-fi art production pipeline (Tripo/GPT-image), final PBR assets
- Full audio/music direction (SFX stubs optional)
- Accessibility modes (colorblind, reduce flash, remapping)
- Save-data migrations beyond existing keys
- Hitstop, advanced VFX, gamepad rumble polish (rumble optional)
- Camera aim/impact shake beyond optional tiny cosmetic sway

## Further Notes

- Domain vocabulary is mandatory in code comments only where needed and in product copy: **Run**, **movement band**, **world stream**, **ship kit**, **wave pattern**, **endless survival**. Avoid “match”, “level”, “loadout”, “arena” as glossary warns.
- Authoritative numbers live in `docs/design/DESIGN.md` and catalogs; if a catalog row and this PRD disagree on a deferred system (powerups, full meta), **defer**; if they disagree on in-scope combat/loop numbers, **prefer DESIGN/catalogs**.
- Scaffold already wires screen routing, input, fixed step host, band movement, Results UI shell, and persist helpers—prefer extending those rather than replacing the layout.
- Success criterion: a human can launch from Hangar, survive and kill through at least the intro waves, die by combat, land on Results with non-zero-capable scoring path and Scrap/high-score writes when earned, and Quick retry into a clean Run—without cheats or console hacks.
- Confirmed testing strategy: **one primary seam = sim world step**; no requirement for persist- or session-level automated tests in this PRD.
