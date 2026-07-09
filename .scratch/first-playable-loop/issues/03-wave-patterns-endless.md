# Wave patterns and endless escalation

Status: `ready-for-agent`
Blocked by: 02

## Parent

`.scratch/first-playable-loop/PRD.md`

## What to build

Replace minimal threat trickle with a real **wave pattern** director so the Run teaches with intro waves, shows a climbing wave index, awards clear bonuses when earned, ramps stream/difficulty, and continues endlessly with easy patterns after intro until death — completing the first playable **endless survival** feel from the PRD.

Combat, death, Results, bomb, and rewards from prior tickets stay in place; this ticket is spawn choreography and escalation on top.

## Acceptance criteria

- [ ] Wave director runs fixed intro patterns (intro_01–intro_03 intent from catalog: drones, darts with down fire, denser gunners as needed) using catalog enemy ids and paths.
- [ ] After a pattern’s spawn window completes, ~0.75 s gap then next wave; world stream never fully stops.
- [ ] HUD wave index increments 1, 2, 3, … through intro and beyond.
- [ ] Wave clear bonus when all wave enemies die before 8 s after last spawn; otherwise no clear bonus (timeout).
- [ ] Kill score uses wave multiplier `1 + 0.05 × (waveIndex - 1)` capped at 3.0; stream and enemy difficulty ramps follow design formulas at least in simplified form.
- [ ] After intro, endless easy continuation (recycled or pool_easy-style patterns) so the Run never soft-locks waiting for missing content.
- [ ] Spawn approach ~y = 18; cull y < -2 or |x| > 10; enemies/bullets leave cleanly.
- [ ] Sim-step tests cover wave advance, gap, clear-bonus window, and post-intro continuation; manual smoke: survive intro, wave counter keeps rising, die later with higher wave on Results.

## Blocked by

- `02-survive-die-close-run` (Survive, die, and close the Run)
