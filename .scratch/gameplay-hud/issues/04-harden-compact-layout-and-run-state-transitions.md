# Harden compact layout and Run-state transitions

Status: `ready-for-agent`

Blocked by: 02, 03

## Parent

[Gameplay HUD readability pass](../PRD.md)

## What to build

Harden the complete redesigned HUD across the supported desktop 4:3 product viewport, a narrower desktop or laptop viewport, and a phone-sized graceful-degradation viewport. Replace arbitrary wrapping with an intentional compact composition, verify the canvas and HUD remain aligned, and confirm that restart or a new Run clears every temporary and terminal state.

This final slice makes the full feature shippable: survival, progression, powerups, set-piece feedback, pause, and Destroyed states fit without clipping or ambiguity, the movement band remains clear, and state never leaks between Runs.

## Acceptance criteria

- [ ] The complete HUD fits the desktop 4:3 product viewport without clipping, overlap, or interference with the movement band.
- [ ] A narrower desktop or laptop viewport uses an intentional compact composition rather than arbitrary flex wrapping.
- [ ] Related labels and values remain atomic and visually associated at every tested viewport.
- [ ] Secondary information compresses or moves before survival status and Run progress lose readability.
- [ ] A phone-sized viewport has no clipped content, overlap, or ambiguous value wrapping, without claiming touch gameplay support.
- [ ] Persistent HUD content, boss bar, pause modal, Destroyed state, player focal area, and likely threat lanes do not overlap at tested viewports.
- [ ] High score, high wave, large Scrap, maximum W-cell values, shield state, multiple timed powerups, and long set-piece values remain stable.
- [ ] Starting or restarting a Run clears pause, Destroyed, boss, timed-powerup, and stale counter presentation immediately.
- [ ] Canvas resize and HUD placement remain synchronized across all tested viewports.
- [ ] Existing desktop keyboard and gamepad controls remain functional; no touch controls are introduced.
- [ ] Browser-level acceptance runs through baseline gameplay, high-value gameplay, set-piece, pause, Destroyed, restart, and new-Run states.
- [ ] Desktop, compact, set-piece, pause, and Destroyed screenshots are captured as evidence.
- [ ] Launch, resize, pause/resume, restart, and new-Run flows introduce no browser errors or HUD-related warnings.

## Blocked by

- [02 — Add Run progression and encounter feedback](02-add-run-progression-and-encounter-feedback.md)
- [03 — Make pause an actionable modal](03-make-pause-an-actionable-modal.md)

## Comments

