# Make combat and shell feel arcade: juice, audio stubs, rumble, sway

Status: `resolved`
Blocked by: none

## Parent

`.scratch/presentation/PRD.md`

## What to build

A Run and menus deliver arcade feedback — combat presentation events drive hit/kill/bomb/pickup/death VFX, SFX stubs and gamepad rumble respect volume settings, camera gets tiny sway with quality gates, and Title/Hangar get light product polish — without production GLBs or full music.

## Acceptance criteria

- [x] Sim emits bounded presentation events at authoritative combat sites (HP hit, shield absorb, kill, bomb, pickup, death); view drains them each frame for lightweight particles/flashes; mesh is never combat authority.
- [x] Quality Low/Medium/High gates bloom/DPR/particle density/sway as specified; tiny cosmetic camera sway only (no hit kick or player-lag follow).
- [x] Audio bus respects master/SFX (and music channel may stay silent); stubs for hit, kill, bomb, pickup, and UI confirm (Launch + Upgrade bay buy minimum); gesture unlock if required.
- [x] Gamepad rumble on damage (~100 ms), life loss (~200 ms), bomb (~150 ms) when hardware exists; no-op otherwise.
- [x] Title hierarchy + Hangar selected-kit preview (silhouette/colors); HUD stays uncluttered.
- [x] Pure tests cover event buffer and gain mapping; visual/audio/rumble/shell are manual smoke.

## Blocked by

None — can start immediately.

## Answer

Presentation events from sim; VFX + sway + quality gates; audio stubs + rumble; Title/Hangar polish; pure buffer/gain tests green.
