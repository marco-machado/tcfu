# Combat and collision rules

Type: `grilling`
Status: resolved
Blocked by: 01

## Question

What are the complete combat and collision rules?

Resolve: player HP numbers and i-frame duration; life loss vs HP; shield powerup interaction; enemy HP classes; collision layers (player, player-shot, enemy, enemy-shot, pickup, hazard); shape policy (sphere/AABB); whether a bomb/special exists; on-hit feedback requirements for the design doc.

## Answer

**Combat and collision rules (locked)**

### Player durability

- 3 HP per life; standard hit = **1** damage; rare **heavy** = **2** if catalog marks it.
- No passive regen; repair only via explicit powerup.
- HP → 0 → lose life → respawn or Results (Core loop).

### I-frames and respawn

- After HP damage: **1.0 s** i-frames (blink; ignore enemy/bullet/hazard; can shoot & pickup).
- After respawn: **2.0 s** i-frames; position `(0, 3.5, 0)`; delete enemy bullets within **r = 3**; enemies stay.

### Shield powerup

- Buffer of **1** hit; on absorb: no HP loss + **0.5 s** i-frames; no multi-stack (refresh to 1); clears on life loss.

### Bomb / special

- Yes: start **2** bombs/run, max **5**; +1 from bomb powerup.
- Use: clear enemy bullets on playfield; **5** damage to all on-screen enemies; **0.75 s** player i-frames; kills score normally.
- Empty stock: input ignored.

### Collision model

- 2D XY only; circles default (player r=0.35 from Spatial); AABB for some elites/hazards if cataloged.
- Default bullet radii: player **0.12**, enemy **0.15** (overridable).
- Discrete tests at fixed timestep; mesh never authoritative.

### Layers

- Player↔enemy body: player damaged, enemy not ram-killed.
- Player↔enemy bullet: player damaged, bullet destroyed.
- Player↔hazard: per catalog; Player↔pickup: collect.
- Player bullet↔enemy: damage, bullet dies unless pierce flag.
- Player bullet↔enemy bullet: no collision.
- Enemy↔enemy: no collision. No friendly fire.

### Enemy HP classes

- Fodder ~1; Grunt 3–6; Elite 15–40; Set-piece 80+. Numbers in `enemies.md`. No regen default.

### Same-frame player damage

- At most one damage instance per step (highest wins); then shield → HP → life; pickups still OK if alive.

### Feedback requirements

- Player hit flash/rumble/SFX; shield-break distinct; life-loss stronger + mercy clear; enemy flash; kill VFX + score pop; bomb screen pulse.
- Hitstop default **off** for v1.

### Doc homes

- Rules → `DESIGN.md` § Combat; numbers in enemies/weapons/powerups catalogs; bindings → Input.

Confirmed by user (batch accept).
