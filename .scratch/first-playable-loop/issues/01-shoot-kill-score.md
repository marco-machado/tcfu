# Shoot, kill, and score under fire

Status: `resolved`
Blocked by: none

## Parent

`.scratch/first-playable-loop/PRD.md`

## What to build

Make the offensive half of the first playable Run work end to end: Launch into a Run, hold-fire Vanguard **pulse_cannon** (tier 0), destroy streaming threats, and see score and kills climb on the HUD.

Includes the prefactor that unblocks everything else: a pure-sim test harness and an entity-capable world (pools, full reset on Launch/retry) with the existing movement band and shell flow left intact. Placeholder bullet and enemy meshes are enough. Enemy contact damage, death, bomb, authored wave director, Scrap, and high scores are not this ticket.

## Acceptance criteria

- [x] Sim tests can step the world with fixed `dt` and injected Commands and assert on world state only (no React/R3F).
- [x] World factory/reset clears all combat entities and session combat fields so Launch/retry never leak bullets, enemies, or score.
- [x] Hold fire spawns player bullets fixed +Y on pulse_cannon tier 0 cooldown; release stops new spawns; bullets move and cull off the corridor.
- [x] Killable threats (at least drones) appear via a minimal continuous or looping spawn so the playfield stays populated without a full wave director.
- [x] Player bullets damage and kill enemies; no ram-kill; score uses enemy base points × wave multiplier (wave may stay 1 until a later ticket); kills increment; HUD shows score and kills.
- [x] Placeholder view meshes track sim positions for player bullets and enemies.
- [x] Manual smoke: Hangar Launch → move and shoot → destroy enemies → score rises.

## Blocked by

None — can start immediately.

## Answer

Implemented offense slice: Vitest + `stepWorld` tests; entity pools on world; pulse_cannon T0 fire; continuous drone spawn on stream; bullet vs enemy kill + score/kills; instanced placeholder meshes; HUD KILLS.
