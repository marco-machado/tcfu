# Make pause an actionable modal

Status: `resolved`

Blocked by: 01

## Parent

[Gameplay HUD readability pass](../PRD.md)

## What to build

Turn pause from an instruction-only overlay into a clear, actionable modal while preserving automatic pause on window blur and the existing keyboard and gamepad pause controls. Resume is the primary action; Settings is available as a secondary action; restart or exit actions are included only where existing shell transitions support them and are protected against accidental activation. Paused and Destroyed remain unmistakably different states.

The completed slice is operable without a pointer: a player can pause, identify the modal state, move focus, resume, visit Settings and return appropriately, and avoid accidentally discarding the current Run.

## Acceptance criteria

- [x] Entering pause stops and visibly dims the Run.
- [x] Resume is the visually and navigationally primary pause action.
- [x] Escape, P, and supported gamepad Start behavior continue to pause and resume consistently.
- [x] Pause actions expose visible focus, hover where applicable, pressed, selected, and disabled states.
- [x] Keyboard and supported gamepad navigation can reach and activate every pause action.
- [x] Settings is available as a secondary action without silently discarding the active Run.
- [x] Restart or exit actions are shown only when supported and use confirmation or equivalent protection from accidental activation.
- [x] Automatic pause on window blur remains functional.
- [x] Destroyed is visually and semantically distinct from Paused and does not expose Resume.
- [x] Modal actions dispatch existing game intents or shell transitions instead of mutating unrelated simulation internals.
- [x] Browser-level checks cover keyboard pause/resume, blur pause, focus order, Settings navigation, destructive-action protection where present, and Destroyed state.
- [x] Pause and Destroyed screenshots plus a clean browser-console check are captured as acceptance evidence.

## Blocked by

- [01 — Establish the survival-first HUD](01-establish-survival-first-hud.md)

## Comments

Resolved. Implementation restructures `src/shell/hud/RunHud.tsx` (powerup badges, W-cell meter, tier pips, boss bar head), adds `src/shell/hud/PauseModal.tsx`, container-query compact layouts in `src/app/styles.css`, a settings return path in the session store, presentation-cue reset on Run start, and a dev-only browser acceptance seam. Browser-level evidence in `../evidence/acceptance-02-04.md`.
