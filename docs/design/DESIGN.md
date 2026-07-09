# Spaceshooter — Design Doc

Implementable design for a desktop 4:3 vertical-scrolling 3D arcade spaceshooter (React Three Fiber). Single-player **endless survival**.

**Glossary:** root [`CONTEXT.md`](../../CONTEXT.md).  
**Catalogs:** [`catalogs/`](./catalogs/).  
**Research:** [`research/r3f-architecture.md`](./research/r3f-architecture.md), [`research/art-pipeline.md`](./research/art-pipeline.md).  
**Decisions source:** wayfinder map [`.scratch/spaceshooter-design/map.md`](../../.scratch/spaceshooter-design/map.md).

Rule: **decisions and rationale here**; IDs, numbers, and lists in catalogs.

---

## 1. Vision & constraints

### Vision

A hi-fi sci-fi vertical shmup: classic arcade readability in full 3D presentation. The player holds a **movement band** while the **world stream** carries threats down a corridor. Runs are short arcade sessions with ship unlocks, mid-run power spikes, and a light persistent meta tree.

### Constraints

| Constraint | Spec |
|------------|------|
| Platform | Desktop only; **4:3** fixed stage (letterbox; never stretch) |
| Mode | **Endless survival** only |
| Multiplayer / online | None (local high scores only) |
| Stack | Vite + React + R3F + Drei + TypeScript |
| Physics | Simple 2D collisions; **no** full rigid-body physics engine |
| Content geometry | Authored **wave patterns** + scaling; no full procedural levels |
| Ships | Fixed **ship kits** (no free-form loadout) |
| Art | High-fidelity PBR sci-fi; production via **Tripo (GLB)** + **GPT-image-2** concepts |

---

## 2. Player fantasy & core loop

### Fantasy

Pilot a customizable-feeling kit (four distinct ships) through endless hostile space. Grow power within a run via **W-cells** and **powerups**; grow across runs via **Scrap** meta upgrades and score-based ship unlocks.

### Screen flow

```
Title → Hangar → Run → Results → Hangar
              ↘ Settings / High Scores
Results → Quick retry (same ship) | Title | High Scores
```

No mid-run ship swap.

### Lives and death

- **3 lives** per run.
- HP per life from ship kit (default **3**; Striker **2**).
- HP → 0: lose a life; if lives remain, **respawn** at band center with invulnerability; clear nearby enemy bullets; enemies stay.
- Lives → 0: **Run** ends → Results. No continues.

### Wave definition

- A **wave** = one scheduled **wave pattern** (or short chain) completing its spawn window.
- Endless index `1, 2, 3, …` on HUD.
- Gap ~**0.75 s** between waves; **world stream** never fully stops.
- Wave clear score bonus if all wave enemies die before **8 s** after last spawn (timeout otherwise).

### Scoring

| Source | Rule |
|--------|------|
| Kill | Enemy base points × wave multiplier |
| Wave clear | Flat bonus, light scale with wave index |
| Pickup | Small points |
| Survival tick | **None** |
| No-damage wave | Bonus if no HP lost that wave |
| Death | No score loss |

Wave multiplier: `1 + 0.05 × (waveIndex - 1)`, **cap 3.0**. Display integer score.

### Ship unlocks

- Evaluated at Results against **single-run score**.
- Thresholds: [`catalogs/ships.md`](./catalogs/ships.md).
- Track career best single-run score.

### Scrap (meta currency)

- Granted at Results only: `floor(score / 100) + floor(wavesCompleted × 5)`.
- Salvage meta rank 3: **+15%** to that payout.
- Spend only in Hangar Upgrade bay.

### Local high scores

- Top **10**; fields: score, ship kit id, wave, time survived (s), timestamp.
- Write on Results if qualifies. Offline `localStorage`.

### Pause / clock

- Pause freezes sim; focus loss auto-pauses.
- Run time = sim time excluding pause; no hard time limit.

---

## 3. Spatial model

### Coordinate frame

Right-handed sim space; **1 unit ≈ 1 m**.

| Axis | Meaning |
|------|---------|
| X | Strafe |
| Y | Along corridor; player forward = **+Y** (toward threats) |
| Z | Cosmetic depth; **gameplay on XY** (`z ≈ 0`) |

### Viewport

- Aspect **4:3**; perspective FOV **~40°** vertical.
- Fixed down-corridor camera; look slightly above band center.
- **Tiny cosmetic camera sway** only (no aim/hit impact).
- No player-lag camera follow.

### Movement band

- X ∈ **[-6, 6]**; Y ∈ **[1.5, 7]**.
- Default/respawn: **(0, 3.5, 0)**.
- Hard clamp on **hitbox center**; wall-axis velocity zeroed.

### World stream

- Game-driven only (player move does not change stream speed).
- Base **4 u/s** along −Y; ramp `base × (1 + 0.02 × (waveIndex - 1))`, **cap 1.5×**.
- Patterns may override stream temporarily.

### Cull / approach

- Spawn approach ~**y = 18**; despawn **y < -2** or **|x| > 10**.

### Hitbox philosophy

- Mesh never authoritative; default player circle **r** from ship catalog (baseline 0.35).
- Visual ship larger than hurtbox.

---

## 4. Combat

### Damage

- Standard hit **1** HP; **heavy** **2** if enemy/hazard catalog marks it.
- No passive HP regen; **repair** powerup only.
- Same sim step: at most **one** player damage instance (highest wins) → shield → HP → life.

### I-frames

| Event | Duration |
|-------|----------|
| After HP damage | **1.0 s** (Phantom base **1.25 s** + meta) |
| After respawn | **2.0 s**; mercy clear enemy bullets within **r = 3** |
| Shield absorb | **0.5 s** |

During i-frames: ignore enemy/bullet/hazard; can still shoot and collect.

### Shield

- Buffer **1** hit; refresh to 1; clears on life loss.

### Bomb

- Default start **2** / max **5** (kit/meta may raise).
- Effect: clear enemy bullets on playfield; **5** damage to on-screen enemies; **0.75 s** i-frames; kills score normally.
- Empty stock: input ignored.

### Collision

- 2D XY; circles default; AABB when cataloged.
- Default bullet r: player **0.12**, enemy **0.15** (weapon/enemy override).
- Layers: see wayfinder combat answer (no player-bullet vs enemy-bullet; no ram-kill; no friendly fire).

### Feedback

- Hit flash, shield-break, life-loss, enemy flash, kill VFX, bomb pulse; gamepad rumble per input design.
- Hitstop **off** v1.

Numbers: [`catalogs/enemies.md`](./catalogs/enemies.md), [`catalogs/weapons.md`](./catalogs/weapons.md).

---

## 5. Progression

### Ship kits

Four kits; hangar select between runs. See [`catalogs/ships.md`](./catalogs/ships.md).

### Weapons + run upgrades

- Each kit has a starting **weapon_id** with tiers **0–3**.
- **W-cells** earn on kills; auto tier at 20 / 50 / 100 cumulative; kept across lives; reset on run end.
- Details: [`catalogs/weapons.md`](./catalogs/weapons.md), [`catalogs/run-upgrades.md`](./catalogs/run-upgrades.md).

### Powerups

Mid-run pickups only. See [`catalogs/powerups.md`](./catalogs/powerups.md).

### Meta tree

Four branches × three ranks (**Arsenal, Hull, Salvage, Thrusters**). Scrap costs 30/75/150. See [`catalogs/meta-upgrades.md`](./catalogs/meta-upgrades.md).

**Stacking:**

```
damage = weaponTier × shipPassive × (1 + arsenal)
move   = baseSpeed × shipMoveMult × (1 + thrusters)
drops  = baseDrop × salvageMult
scrap  = floor((score/100 + waves×5) × (1 + salvageScrapBonus))
```

Ship unlocks are **score**, not Scrap.

---

## 6. Threats & difficulty

- Authored patterns + pools; difficulty multipliers by wave index.
- Enemies and patterns: [`catalogs/enemies.md`](./catalogs/enemies.md), [`catalogs/wave-patterns.md`](./catalogs/wave-patterns.md).

### Curve (by wave `w`)

| Stat | Formula | Cap |
|------|---------|-----|
| Enemy HP | `base × (1 + 0.04×(w-1))` | 2.5× |
| Enemy shot speed | `base × (1 + 0.03×(w-1))` | 2.0× |
| Enemy fire cooldown | `base / (1 + 0.025×(w-1))` | min 0.5× cooldown |
| Event time scale | `1 / (1 + 0.015×(w-1))` | 0.7 |
| Stream | Spatial formula | 1.5× |

Set-piece: first wave **10**, then every **10**; milder fire mult; optional stream **0.85×**.

---

## 7. Presentation

### Art

- Hi-fi sci-fi PBR; readability first (cyan player / warm enemy / gold-green pickups).
- Post: bloom + light vignette; no DOF/SSR in Run.
- Quality: Low / Medium / High; **60 fps** intent at Medium.
- Authoring: **Tripo → GLB**, **GPT-image-2** concepts; prompts in [`research/art-pipeline.md`](./research/art-pipeline.md).

### Audio

- **Open:** full music direction TBD.
- **Required stubs:** SFX for hit, kill, bomb, pickup, UI confirm; music slider may sit at 0 until content exists.

---

## 8. Input & UI shell

### Input

- Keyboard primary + gamepad first-class; no mouse aim; fixed +Y fire.
- Hold-to-fire; bomb on edge.
- Move: max **8 u/s** × ship × meta; accel **40** / decel **50** u/s²; deadzone **0.15**.
- Defaults only (no rebind v1).

| Action | Keyboard | Gamepad |
|--------|----------|---------|
| Move | WASD / arrows | Left stick + D-pad |
| Fire | Space / J | RT / A (held) |
| Bomb | Shift / K | LT / B (edge) |
| Pause | Esc / P | Start |

Rumble: damage ~100 ms weak; life loss ~200 ms; bomb ~150 ms.

### UI shell

- DOM over canvas; logical stage **1024×768** (4:3), letterboxed.
- **Title:** Play, High Scores, Settings.
- **Hangar:** ship grid, preview, Launch, Upgrade bay, Scrap/best, last ship.
- **Run HUD:** score, wave, lives, HP, shield, bombs, weapon tier, W-cells, timed powerups; boss bar on set-piece; chrome in outer margins only.
- **Pause:** Resume, settings subset, Quit Hangar (confirm).
- **Results:** stats, Scrap, PB?, unlocks, Quick retry, Hangar, High Scores, Title.
- **High Scores:** top 10.
- **Settings:** quality, audio sliders, read-only binds, reset meta / high scores (confirm).

---

## 9. Technical architecture

Summary (detail: [`research/r3f-architecture.md`](./research/r3f-architecture.md)):

| Layer | Role |
|-------|------|
| **Sim** | Authority: positions, combat, waves, score |
| **View (R3F)** | Meshes, VFX, camera sway; mutate from sim |
| **Shell (DOM)** | Screens + HUD |

- Fixed timestep **1/60** with accumulator; collisions on sim steps only.
- Mutable world + entity pools; Zustand for session/meta/shell.
- **Never** React `setState` in `useFrame` for motion.
- Internal 2D collision module; no Rapier/cannon for gameplay.
- Persist: high scores, `tcfu.meta`, `tcfu.settings`, last ship.

**ADR (when implementing):** fixed-timestep sim outside React render; simple 2D collision; R3F as view only — create under `docs/adr/` at stack lock time.

Suggested folders: `src/app`, `src/shell`, `src/sim`, `src/view`, `src/input`, `src/persist`.

---

## 10. Non-goals & open questions

### Non-goals (out of scope)

- Mobile / touch
- Multiplayer, accounts, cloud saves, online leaderboards
- Full physics as gameplay basis
- Procedural level geometry as primary content
- Campaign / mission select
- Free-form loadout crafting
- Input rebinding UI (v1)

### Open questions

- Full audio / music direction and implementation
- Finer performance budgets beyond quality tiers + 60 fps intent
- Save-data migrations / versioning scheme
- Accessibility: colorblind modes, reduce flash, remapping
- Pause/focus edge cases beyond basic pause + blur auto-pause
