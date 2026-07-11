# Catalog: Wave patterns

Authored patterns + playlist pools. No full procedural geometry.

## Pattern language

**Spawn event:** `t` (s from pattern start), `enemy_id`, `x`, `y` (default 18), `path_id`, `aim` (`none` | `down` | `at_player_at_spawn`).

**Macros:** `line_h`, `v_column`, `vee`, `sweep_lr`, `sweep_rl` (expand to events in data or tooling).

**Paths:** `drift_down`, `sine_x`, `strafe_enter_left`, `strafe_enter_right`, `hold_and_shot`, `dive`.

## Wave lifecycle

- Gap ~0.75 s between waves.
- Clear bonus if all wave enemies dead before 8 s after last spawn: `floor(250 × (1 + 0.1 × (waveIndex − 1)))`.
- No-damage bonus if player HP never decreased during the wave (shield absorb OK): `floor(150 × (1 + 0.1 × (waveIndex − 1)))`, awarded when the wave enters gap; stacks with clear when both apply.

## Playlist

| Band | Waves | Pool |
|------|-------|------|
| Intro | 1–3 | Fixed sequence below |
| Early | 4–10 | pool_easy; wave 10 is set-piece |
| Mid | 11–20 | pool_mid; every 5th wave elite-tagged; wave 20 is set-piece |
| Late | 21+ | pool_late; every 5th elite mix; every 10th set-piece |

The set-piece override takes precedence over pool selection in every band (ADR 0002).

Set-piece schedule: wave **10**, **20**, **30**, …  
Total authored patterns target: **24** (3 intro + 8 easy + 7 mid + 4 late + 2 set-piece).

## Intro (fixed)

### intro_01 — teach move/shoot

| t | macro / events |
|---|----------------|
| 0.0 | `line_h(4, -4, 4, drone, drift_down)` |
| 2.5 | `line_h(4, -4, 4, drone, drift_down)` |

No enemy shots.

### intro_02 — teach dodge

| t | events |
|---|--------|
| 0.0 | line of 5 `dart`, path `dive`, aim `down` |
| 2.0 | `drone` sine_x ×4 |
| 4.0 | `dart` column x=0 ×3 |

### intro_03 — denser + powerup

| t | events |
|---|--------|
| 0.0 | `gunner` hold_and_shot at x=−2 and x=2 |
| 1.5 | `line_h(6, -5, 5, drone)` |
| 3.0 | Force one `rate_up` or `shield` drop via pattern flag |

## pool_easy (8)

| id | intent | sketch |
|----|--------|--------|
| easy_line_drones | fodder lines | 2–3 line_h drones |
| easy_dart_dive | dodge lanes | dart dive columns |
| easy_vee | classic V | vee drones |
| easy_sweep_lr | lateral read | sweep_lr drones + 1 gunner |
| easy_sides | side enter | strafe_enter left/right drones |
| easy_gunner_pair | first guns | 2 gunners + fodder |
| easy_sine_wall | sine wall | sine_x drones dense |
| easy_mixed_lite | mix | drones + darts + 1 sidecar |

## pool_mid (7)

| id | intent | sketch |
|----|--------|--------|
| mid_gun_wall | grunt pressure | gunners + drones |
| mid_sidecar_lane | side shots | sidecars drift |
| mid_double_sweep | two sweeps | sweep_lr + sweep_rl |
| mid_hold_squad | pause shooters | 3× hold_and_shot gunner |
| mid_elite_razor | elite intro | 1 razor + fodder screen |
| mid_prism_burst | ring threat | 1 prism + darts |
| mid_chaos_mix | density | all grunt types light |

## pool_late (4)

| id | intent | sketch |
|----|--------|--------|
| late_razor_pair | dual elite | 2 razor staggered |
| late_prism_grid | rings + fodder | prism + dense drones |
| late_gauntlet | continuous pressure | overlapping mid macros |
| late_mixed_elites | razor+prism | elite duo + sidecars |

## Set-piece (2)

| id | stream_override | content |
|----|-----------------|---------|
| set_colossus | 0.85× current | `colossus` + light dart pressure |
| set_colossus_prism | 0.85× | `colossus` + `prism` support |

## Implementation note

Full numeric spawn tables for all 24 can be expanded during content production; **ids, pools, intro sequences, and set-piece rules above are binding**. Implementers may flesh event rows without changing playlist rules.
