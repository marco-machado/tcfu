# Spatial playfield model

Type: `grilling`
Status: resolved
Blocked by: 01

## Question

What are the concrete spatial rules for the 4:3 vertical corridor?

Resolve: camera pose/FOV/projection; movement band dimensions and clamp behavior; world stream speed authority and whether it ramps with difficulty; how much Z-depth is cosmetic vs gameplay; readable playfield margins; relationship between ship size and hitbox.

## Answer

**Spatial playfield model (locked)**

### Coordinate frame (sim space)

Right-handed sim space, 1 unit ≈ 1 meter:

| Axis | Meaning |
|------|---------|
| **X** | Lateral (left / right strafe) |
| **Y** | Up the screen / along corridor (forward in band = +Y toward threats) |
| **Z** | Depth — mostly cosmetic; gameplay collision on **XY play plane** (`z ≈ 0`) |

Threats/pickups spawn at high +Y and approach via **world stream**. Player stays in **movement band** at low +Y.

### Viewport (4:3 desktop)

- Aspect **4:3 fixed** (letterbox/pillarbox; never stretch).
- **Perspective** projection; FOV **~40° vertical**.
- Fixed down-corridor camera; look at playfield center (slightly above band center).
- **Tiny cosmetic camera sway** allowed (idle / light motion juice only): must not change aim, hit registration, or readable framing; no gameplay orbit, no FOV punch required for v1.
- Camera not player-lag follow.

### Movement band

- AABB on play plane: **X ∈ [-6, 6]** (width 12); **Y ∈ [1.5, 7]** (height 5.5).
- Respawn/default: `(0, 3.5, 0)`.
- **Hard clamp** on hitbox center each sim step; wall-axis velocity zeroed.
- Mesh may overhang clamp slightly; clamp is hitbox-based.

### Visible vs offscreen

- Full band readable inside 4:3; HUD must not occlude mandatory band (HUD layout in UI ticket).
- Approach corridor ~**y = 18 → band**; despawn **y < -2** or **|x| > 10** (and bullets past far bounds).
- Side margins ~10–15% view for scenery/VFX only; no required combat there.

### World stream

- **Game-driven only**; player accel/decel does **not** change stream speed (those only move ship in band).
- Streams: enemies, enemy bullets, pickups, hazards, scenery.
- Base speed **4 u/s** along −Y (or equivalent “content approaches player”).
- Ramp: `base × (1 + 0.02 × (waveIndex - 1))`, **cap 1.5×**.
- Wave patterns may temporarily override stream speed explicitly.

### Depth (Z) policy

- Cosmetic: mesh offset, bob, banking, parallax — yes.
- Gameplay Z dodging / Z collision tests — **no** for v1; collisions are 2D on XY.

### Ship size vs hitbox

- Authoritative size = **hitbox**, not mesh.
- Default player hitbox: circle **r = 0.35**.
- Visual ship larger (~1.0–1.5 long); hurtbox smaller than silhouette.
- Enemy sizes: explicit in `enemies.md`.

### Orientation

- Player faces **+Y** always; fixed forward fire baseline; banking cosmetic only.

### Doc homes

- Axes, camera (incl. sway), band, stream, Z policy, clamp, cull → `DESIGN.md` § Spatial model.
- Move curves → Input ticket; layers/i-frames → Combat; patterns → Wave patterns; post stack → Art research.

### User override

- Cosmetic camera sway **included** (was optional/out in first draft).

Confirmed by user (batch accept + sway).
