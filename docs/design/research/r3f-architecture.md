# Research: R3F architecture for arcade shmup

Supporting note for `docs/design/DESIGN.md` § Technical architecture.  
Source ticket: `.scratch/spaceshooter-design/issues/05-r3f-architecture.md`.

## Question

Module boundaries and runtime pattern for Vite + React + R3F + Drei + TypeScript endless vertical shmup (planar combat, simple collisions, hi-fi presentation).

## Recommendation summary

### Layers

| Layer | Owns | Must not own |
|-------|------|----------------|
| **Sim** | Positions, HP, score, waves, collisions, commands | React render, materials, postprocessing |
| **View (R3F)** | Meshes, lights, VFX, camera sway, sync from sim | Game rules, authoritative positions |
| **Shell (DOM React)** | Title, Hangar, Results, pause, settings, HUD text | Per-frame entity motion |

Gameplay authority is **sim-only**. R3F is a renderer of sim state.

### Fixed timestep

- Display loop: R3F `useFrame`.
- Sim step: fixed **1/60 s** with accumulator; clamp max steps per frame (e.g. 5).
- Collisions only on sim steps; optional mesh interpolation for render.
- Pause: stop sim accumulation; keep rendering menus.

Do not run combat sim on raw variable `delta` alone (refresh-rate drift).

### State

| Kind | Where |
|------|--------|
| Entities / bullets / timers | Mutable **world + pools** (module), not React state |
| Run session (score, lives, wave, bombs) | Zustand OK; update on discrete events or end of sim step |
| Meta / high scores | Zustand + `localStorage` |
| UI chrome | React `useState` |

**Hard rule (R3F):** never `setState` inside `useFrame` for motion. Mutate refs/world; read Zustand with `getState()`.

Prefer entity pools and **InstancedMesh** (or manual Object3D pools) over hundreds of declarative bullet components.

### Suggested boundaries

```
src/app/          # shell routing
src/shell/        # DOM screens / HUD
src/sim/          # world, step, systems, catalog types
src/view/         # Canvas, SimDriver, entity views, fx
src/input/        # device → command buffer
src/persist/      # high scores, meta
```

### Collision

- No full physics engine (Rapier/cannon out for gameplay).
- Small internal 2D module: circle/AABB + layer matrix from combat design.
- Broadphase optional later; brute force with pools is enough for v1 scale.

### Scene layers (view)

Background/parallax → gameplay meshes → VFX → camera (fixed + cosmetic sway).  
DOM HUD over canvas by default.

### Hi-fi isolation

PBR, bloom, particles, mesh LOD live in `view/` and assets. Sim emits **events** (hit, kill, bomb, pickup); view consumes them. Sim stores logical ids, not materials.

### Input

Sample devices once per display frame into a command buffer; sim steps reuse that sample for the frame’s fixed steps.

### ADR

Recorded as [ADR 0006](../../adr/0006-fixed-timestep-sim-view-only-r3f.md): fixed-timestep sim outside React render; R3F mutates from world; no per-frame React entity state; simple 2D collision module.

## References

- [R3F Performance pitfalls](https://r3f.docs.pmnd.rs/advanced/pitfalls) — mutate in `useFrame`, deltas, avoid `setState` in the loop; Zustand `getState` pattern.
- [R3F useFrame](https://r3f.docs.pmnd.rs/api/hooks) — shared render loop; slim callbacks.
- Fix-your-timestep / fixed step accumulator (standard gamedev practice for fair combat).
