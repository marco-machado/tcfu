# Make every ship kit a complete selectable identity

Status: `resolved`
Blocked by: none

## Parent

`.scratch/ship-kit-identity/PRD.md`

## What to build

Each ship kit plays and reads as its catalog fantasy — correct hitbox/HP/bombs/move/passives (including Aegis shield every life), career-best unlocks independent of the top-10 list, Hangar/Results identity copy, and distinct placeholder meshes — without changing weapon tier tables.

## Acceptance criteria

- [x] A single kit table drives stats, passives, unlock thresholds, and display copy; createWorld/respawn apply hitbox, HP, bombs, move mult, and passives (Aegis start_shield on every life; Phantom hit i-frames; Striker dmg_10 retained).
- [x] Career best single-Run score persists and updates at Results; Hangar unlocks use career best (not top-10 max); Results names the kit and announces newly unlocked kits.
- [x] Hangar unlocked cards show HP, hitbox, move, start bombs, passive one-liner, and weapon line name; locked cards show blurb + unlock score only; invalid last ship falls back to Vanguard.
- [x] Placeholder player mesh/material differs by kit (silhouette/color); mesh is not collision authority.
- [x] Pure unlock/career-best tests and sim create/respawn tests cover kit stats and Aegis re-shield; shell/view is manual smoke.

## Blocked by

None — can start immediately.

## Answer

Kit table + create/respawn stats; Aegis shield each life; career best unlocks; Hangar/Results identity; kit placeholder meshes; tests green.
