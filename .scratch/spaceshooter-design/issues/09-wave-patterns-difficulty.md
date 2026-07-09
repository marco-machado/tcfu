# Wave patterns and difficulty curve

Type: `grilling`
Status: resolved
Blocked by: 02, 04

## Question

How are authored wave patterns and endless difficulty scaling specified?

Resolve: pattern vocabulary (entries, formations, timings); enemy roles (fodder, elite, set-piece); how the curve escalates (spawn rate, HP, shot speed, pattern density); when set-pieces appear; what the design must tabulate vs leave to implementation tuning.

## Answer

**Wave patterns and difficulty curve (locked)**

### Wave lifecycle

- Gap ~0.75s between waves; stream continuous.
- Clear bonus if all wave enemies dead before **8s** post-last-spawn timeout.

### Pattern language

- Authored spawn events: `t, enemy_id, x, y, path_id, aim`.
- Macros: line_h, v_column, vee, sweep_lr/rl.
- Paths: drift_down, sine_x, strafe_enter_left/right, hold_and_shot, dive.

### Enemies (v1)

`drone`, `dart` (fodder); `gunner`, `sidecar` (grunt); `razor`, `prism` (elite); `colossus` (set-piece). HP/points as recommended; W-cells by class.

### Playlist

- Waves 1–3 fixed intro; then pools easy/mid/late by wave band.
- Elite-tagged every 5 from mid; set-piece wave 10 then every 10.
- **24** authored patterns (3+8+7+4+2).

### Difficulty mults (by wave)

- HP ×(1+0.04×(w-1)) cap 2.5×; shot speed cap 2×; fire cooldown down to 0.5×; optional event time scale to 0.7; stream per Spatial.
- Set-piece: milder fire mult; optional stream 0.85×.

### Catalogs

`enemies.md`, `wave-patterns.md`; formulas in DESIGN § Threats.

Confirmed by user (batch accept).
