# Play the full catalog: new enemies, 24 patterns, playlist, and set-pieces

Status: `resolved`
Blocked by: none

## Parent

`.scratch/content-depth/PRD.md`

## What to build

Endless Runs escalate through the authored catalog — sidecar / razor / prism / colossus, all 24 wave patterns, deterministic playlist bands with set-piece milestones and elite-tagged cadence, set-piece stream slowdown, boss bar, and readable placeholders — so survival past intro is no longer a four-pattern easy loop.

## Acceptance criteria

- [x] Playlist selection is pure and deterministic by wave index: intro 1–3, easy 4–10 (except 10), mid 11–20 (except 20), late 21+ (except 30…), set-piece on wave ≥ 10 when wave % 10 === 0 alternating the two set-piece patterns, elite-tagged mid/late on wave % 5 === 0 when not set-piece, wave 5 stays easy.
- [x] All 24 catalog pattern ids exist and play; intro intent (including intro_03 forced powerup) is preserved; set-piece waves use stream × 0.85.
- [x] Sidecar, razor, prism, and colossus spawn with catalog class/stats; side shots, aimed burst (no homing), ring-8, and colossus spray/pause + heavy contact 2 + AABB; W-cells/drops follow class rules; bomb still damages them.
- [x] Strafe-enter paths work for side-entry patterns; placeholders distinguish kinds; boss bar shows set-piece HP while active and hides otherwise.
- [x] Pure playlist tests and sim step tests cover schedule, new combat behaviors, stream override, and class economy; shell/view is manual smoke.

## Blocked by

None — can start immediately.

## Answer

Full catalog playlist (24 patterns), new kinds (sidecar/razor/prism/colossus) with shots/paths/AABB, set-piece stream mult, boss bar, placeholders; playlist + combat tests green.
