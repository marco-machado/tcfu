# Spaceshooter design wayfinder

Label: `wayfinder:map`

## Destination

A written design package ready to implement: stack and architecture boundaries, core loop, spatial/combat model, ships/weapons/powerups/run upgrades/meta tree, wave/difficulty approach, art direction for hi-fi sci-fi, input, and offline shell/UI — clear enough that build can start without further design fog.

## Notes

- **Domain**: vertical-scrolling 3D arcade spaceshooter; glossary in `CONTEXT.md`.
- **Skills**: `/grilling`, `/domain-modeling` for decisions; `/research` for stack and art pipeline; `/prototype` only if a feel question cannot be decided in prose.
- **Plan, don't do**: this map produces design decisions and documents, not the game build (unless a ticket is explicitly a Task that unblocks a decision).
- **Tracker**: local markdown under `.scratch/spaceshooter-design/`.
- **Git**: Conventional Commits for messages and branches; logical groups.
- **Standing product locks** (from charting):
  - Desktop **4:3** only; no mobile.
  - **R3F** playfield: classic vertical shmup layout in 3D (planar play, full 3D models); camera down the corridor; content streams toward the player.
  - **4-way movement**: left/right strafe + forward/back inside a **movement band**; **world stream** is game-driven, not player thrust.
  - **Endless survival** only; run ends on death; small HP (or 2–3 hits) + optional shield powerup; i-frames; small life stock; local high scores; fully offline.
  - **Ship kits** unlocked by **score milestones**; chosen between runs.
  - **Powerups** (mid-run) + **run upgrades** (in-run tiers, reset each run) + **persistent meta-upgrade tree**.
  - Threats: **authored wave patterns** + difficulty scaling (fodder / elites / set-pieces); no full procedural geometry.
  - Stack: **Vite + React + R3F + Drei + TypeScript**; game state off the React hot path; **simple collisions**, not a full physics engine.
  - Art bar: **high-fidelity sci-fi** (detailed meshes, PBR, cinematic post).
  - Input: **keyboard primary + first-class gamepad**; mouse not required for core loop.

## Decisions so far

- [Design artifact shape](issues/01-design-artifact-shape.md) — Package is `docs/design/DESIGN.md` + `catalogs/*` + sparse `docs/adr/` + research notes; fixed DESIGN outline; seven required catalogs; done = implementable defaults, not perfect balance.
- [Core loop and scoring](issues/02-core-loop-and-scoring.md) — Title→Hangar→Run→Results; 3 lives × 3 HP; wave index endless; score from kills/waves/pickups/clean-wave (no passive time); ship unlocks by single-run score; top-10 local high scores; meta currency paid at Results.
- [Spatial playfield model](issues/03-spatial-playfield.md) — XY planar play, perspective 4:3 ~40° FOV, movement band ±6×[1.5–7], game-driven world stream with mild wave ramp, Z cosmetic only, player hitbox r=0.35, tiny cosmetic camera sway.

## Not yet specified

- Audio / music direction and implementation approach
- Performance budgets and target hardware profile for hi-fi web
- Save-data shape for meta unlocks (high-score table fields/size locked in Core loop; meta inventory schema still open)
- Accessibility (colorblind, reduce flash, remapping beyond defaults)
- Whether a bomb/special resource exists beside weapons and powerups
- Exact content volume targets (ship count, pattern count) once catalogs start
- Pause/focus edge cases beyond basic pause + auto-pause on blur (already locked in Core loop)

## Out of scope

- Mobile / touch controls and responsive layouts other than fixed 4:3 desktop
- Multiplayer, accounts, cloud saves, online leaderboards
- Full rigid-body physics as the gameplay basis
- Fully procedural level geometry as the primary content model
- Campaign / mission-select modes (endless survival is the mode)
- Deep free-form loadout crafting (ships are fixed kits, not mix-any-parts)
