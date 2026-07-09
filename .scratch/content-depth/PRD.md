# Content Depth

Status: `resolved`

## Problem Statement

After the first playable loop, powerups, W-cells, and the Upgrade bay, a Run still recycles a thin threat set: three enemy kinds and four easy wave patterns after intro. Long survival never introduces catalog elites, sidecars, full easy/mid/late playlists, or Colossus set-pieces. Endless escalation is mostly numeric ramps on the same fodder, so the designed content depth is not playable.

## Solution

Ship the catalog threat roster and the full authored playlist so endless survival escalates through **wave patterns** and new enemy kinds. Add sidecar, razor, prism, and colossus with their classes, shots, and paths; complete all **24** wave pattern ids across intro / early / mid / late / set-piece; drive selection with a deterministic playlist director (set-piece schedule, band pools, elite-tagged picks); apply set-piece stream override and a **boss bar** while a set-piece is active; keep presentation as readable placeholders.

## User Stories

1. As a player, I want early waves after intro to cycle a full easy pattern pool, so that the first stretch is not four patterns forever.
2. As a player, I want mid-wave bands to use mid patterns, so that pressure and composition change after the early band.
3. As a player, I want late waves to use late patterns, so that deep survival feels distinct from mid.
4. As a player, I want waves 10, 20, 30, … to be set-piece encounters, so that milestones feel like highlights.
5. As a player, I want set-piece waves to alternate Colossus-only and Colossus-plus-prism patterns, so that repeats stay readable but not identical.
6. As a player, I want set-piece waves to slightly slow the world stream, so that the highlight is more readable under pressure.
7. As a player, I want mid and late multiples of five that are not set-pieces to prefer elite-tagged patterns, so that elites appear on a predictable cadence.
8. As a player on wave 5, I want easy-pool content still, so that elites do not arrive before the mid band.
9. As a player, I want the same wave index to always load the same pattern, so that practice and debugging are fair and reproducible.
10. As a player, I want intro waves 1–3 to keep their teaching intent (including intro_03 forced powerup), so that the opening lesson is not rewritten.
11. As a player, I want to fight sidecar grunts that fire side shots while drifting, so that lateral threat appears in easy/mid mixes.
12. As a player, I want to fight razor elites that fire aimed bursts at my position at fire time, so that I must dodge committed aim, not homing.
13. As a player, I want to fight prism elites that emit bullet rings, so that I face radial coverage threats.
14. As a player, I want to fight a Colossus set-piece with a large body and heavy contact, so that the highlight has weight.
15. As a player, I want Colossus to alternate spray and pause fire phases, so that the fight has readable windows.
16. As a player, I want Colossus contact to deal heavy damage (2 HP), so that body-blocking it is punished.
17. As a player, I want player bullets and bombs to damage Colossus normally (bomb still 5), so that panic tools remain valid.
18. As a player, I want new enemies to award W-cells and powerup rolls by class (grunt / elite / set_piece), so that economy matches existing rules.
19. As a player, I want set-piece kills to guarantee a useful drop when the on-field cap allows, so that Colossus rewards match class design.
20. As a player, I want wave difficulty multipliers to still apply to new kinds, so that deep waves stay hard without unique secret rules.
21. As a player, I want enemies that strafe in from the sides when patterns call for it, so that side-entry choreography works.
22. As a player, I want no ram-kill on any new enemy, so that body-blocking is never an exploit.
23. As a player, I want a boss bar on the Run HUD while a set-piece enemy is alive, so that Colossus HP is legible.
24. As a player, I want the boss bar to hide when no set-piece is active, so that normal waves stay uncluttered.
25. As a player, I want new enemy kinds to be visually distinguishable as placeholders, so that I can read threat type without production art.
26. As a player, I want wave clear bonus, gaps, and endless continuation to still work after new content, so that the Run loop is unchanged in structure.
27. As a player, I want cull and spawn approach rules to still bound the sim, so that performance stays stable with denser patterns.
28. As a developer, I want playlist selection pure and deterministic from wave index, so that tests do not need React or RNG.
29. As a developer, I want new combat behaviors proven through the existing world step seam, so that content does not invent a second authority.
30. As a developer, I want pattern ids and pool membership to match the wave-pattern catalog, so that design and code stay aligned.

## Implementation Decisions

### Scope

- Deliver full catalog content depth: four new enemy kinds, all twenty-four wave pattern ids, playlist director, set-piece stream override, boss bar, placeholder presentation.
- Do not change meta upgrades, powerup catalog, ship kits, or Scrap rules except where new classes already feed existing W-cell/drop tables.

### Playlist director

- Wave index is 1-based. Selection is a pure function of wave index (ADR `0002-wave-playlist-precedence`).
- Precedence:
  1. Set-piece if `wave >= 10` and `wave % 10 === 0`.
  2. Intro if `wave <= 3` (fixed intro_01–03).
  3. Early / `pool_easy` if `4 <= wave <= 10` and not set-piece.
  4. Mid / `pool_mid` if `11 <= wave <= 20` and not set-piece.
  5. Late / `pool_late` if `wave >= 21` and not set-piece.
- Set-piece alternation: wave 10, 30, 50, … → `set_colossus`; wave 20, 40, 60, … → `set_colossus_prism`.
- Elite-tagged preference: when `wave % 5 === 0` and not set-piece, mid and late bands pick from elite-tagged subsets (mid: `mid_elite_razor`, `mid_prism_burst`; late: elite-heavy late ids such as `late_razor_pair`, `late_mixed_elites`, `late_prism_grid`). Early wave 5 stays in `pool_easy` with no elite force.
- Within a pool (or elite subset), cycle with a stable modular index derived from wave so the same wave always maps to the same pattern. No random playlist.

### Pattern content

- Implement all catalog ids: 3 intro (existing intent preserved), 8 easy (complete the four missing: sweep, sides, sine wall, mixed lite), 7 mid, 4 late, 2 set-piece.
- Expand macros in data helpers (`line_h`, columns, vee, `sweep_lr`, `sweep_rl`, side enters) into concrete spawn events.
- Intro_03 forced powerup event remains.
- Set-piece sketches binding: `set_colossus` = one colossus + light dart pressure; `set_colossus_prism` = colossus + prism support + light pressure.
- For set-piece waves, apply `streamSpeed = streamSpeedForWave(wave) × 0.85` for the duration of that wave (restore normal stream formula on the next non-set-piece wave start).

### Enemy roster

| Kind | Class | Base HP | Points | Hitbox | Contact | Shot behavior | Default path family |
|------|-------|---------|--------|--------|---------|---------------|---------------------|
| sidecar | grunt | 5 | 350 | circle 0.55 | 1 | side pair L+R on interval | drift_down |
| razor | elite | 20 | 1200 | circle 0.70 | 1 | aimed burst (5 bullets toward player position at fire time; no homing) | hold_and_shot |
| prism | elite | 28 | 1500 | circle 0.70 | 1 | ring of 8 bullets, cooldown, repeat | hold_and_shot |
| colossus | set_piece | 100 | 5000 | AABB 2.0×1.2 | heavy 2 | multi-phase spray ~3 s / pause ~2 s loop | set-piece hold |

- Existing drone / dart / gunner unchanged in role; class mapping fodder / fodder / grunt retained.
- Wave difficulty multipliers (HP, shot speed, fire cooldown, stream) apply to new kinds; set-piece stream override stacks as above.
- W-cells and drop chances follow existing class tables; set_piece guaranteed useful drop subject to on-field cap.
- Bomb deals 5 to on-screen enemies including colossus; no special immunities.
- No ram-kill; contact damages player only.

### Colossus behavior

- Enter and hold near the hold line used by hold-and-shot enemies; large AABB body.
- Loop: spray phase (multi-way downward fan on a fixed cadence for ~3 s) → pause (~2 s, no shots) → repeat until dead or Run ends.
- Prefer not to soft-despawn solely by drifting off while held; safety cull still applies if it leaves bounds.

### Paths and shots

- Add paths: `strafe_enter_left`, `strafe_enter_right` (enter from off-corridor X, reach lane X, then drift down). Keep existing drift_down, sine_x, dive, hold_and_shot.
- Add shot styles for side pair, aimed burst, ring-8, and boss spray. Enemy bullet radius default 0.15; bullet damage 1 (heavy contact is body-only for colossus).

### Collision

- Keep 2D XY sim authority. Circles default; AABB only where cataloged (colossus body vs player hurtbox and player bullets). Extend shared collision helpers; no physics engine.

### Presentation

- Placeholder meshes/materials differentiated by kind (size/color). Colossus large box matching AABB readability.
- Boss bar: while any active enemy has class `set_piece`, show that enemy’s current HP / max HP (if multiple, prefer the primary colossus / highest max). Hide when none active. Shell reads world only.

### Architecture

- Preserve sim / view / shell split. Playlist and enemy stats live in sim; view renders; shell HUD shows boss bar.
- Centralize kind stats (hp, points, class, radii, fire cadence) and configure spawns from pattern events.
- Wave lifecycle (gap ~0.75 s, clear bonus window 8 s, endless continuation) unchanged in structure.

### Modules to deepen

- Pattern tables and macros; pure playlist selector.
- Enemy kind configuration, path step, shot fire, AABB collision.
- Wave begin stream override for set-piece.
- View entity presentation for new kinds.
- Run HUD boss bar.

## Testing Decisions

### What makes a good test

- Assert external behavior: given wave index, which pattern id/pool membership; given world steps, enemy class, W-cells, drops, shot outcomes, stream speed, collision HP, boss-bar selector inputs.
- Do not assert React trees, mesh graphs, pool slot indexes, or private helper names.
- Prefer deterministic pure playlist tests and fixed-dt `stepWorld` combat tests with suspended or controlled waves where useful.

### Seams

1. **Playlist selection (pure, primary for schedule):** wave index → pattern id / pool rules (set-piece, bands, elite-tagged, determinism).
2. **Combat (existing `stepWorld`):** new kinds’ class and awards; sidecar / razor / prism / colossus fire; colossus heavy contact and AABB damage; bomb vs colossus; stream ×0.85 on set-piece waves; existing drop/W-cell class paths for grunt/elite/set_piece.
3. **Boss bar (optional pure helper):** given world enemies, whether to show and HP ratio — or manual smoke only if trivial DOM binding.

No browser E2E suite required for this PRD.

### Coverage expectations

- patternForWave (or equivalent) for waves 1–3, 4–9, 5 (easy not elite force), 10/20/30 set-piece ids, 11–19 mid, 15 elite-tagged mid, 21+ late, 25 elite-tagged late.
- Sidecar side shots; razor aim snapshot (not homing); prism ring count; colossus spray/pause; colossus contact 2; bullet/AABB damage.
- Set-piece stream mult; W-cell awards 2/5/15 for grunt/elite/set_piece on the new kinds.
- Prior art: existing wave director, drop economy, and combat step tests.

## Out of Scope

- Production art pipeline, final GLBs, VFX polish, audio, rumble
- No-damage-wave score bonus
- Procedural primary level generation
- New powerup types, weapon lines, ship kits, or meta ranks
- Refunds/respec or Upgrade bay changes
- Hitstop, camera impact shake, full boss cinematic
- Multiplayer, online leaderboards, campaign modes
- Homing missiles or post-spawn bullet retargeting for razor

## Further Notes

- Domain vocabulary: **wave pattern**, **playlist band**, **elite** (class), **set-piece**, **boss bar**, **Run**, **world stream**, **endless survival**. Do not call set-pieces boss levels or stages.
- Binding ids and pool lists live in `docs/design/catalogs/wave-patterns.md` and enemy rows in `docs/design/catalogs/enemies.md`. This PRD locks playlist precedence, elite cadence, concrete combat numbers where catalog was sketchy (burst count 5, ring 8, colossus phases, heavy contact yes), and testing seams.
- Success criterion: a human can survive past wave 10, fight a Colossus with a boss bar and slowed stream, see mid/late composition change, and encounter sidecar/razor/prism in catalog roles; sim tests lock playlist and combat without UI automation.
- Confirmed seams: pure playlist selector + `stepWorld`; boss bar thin/helper or smoke.
