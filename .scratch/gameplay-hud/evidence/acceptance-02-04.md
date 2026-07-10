# Progression, pause modal, and layout hardening acceptance evidence

Captured through the rendered Run screen in a real browser via the dev-only acceptance seam (`window.__tcfuAcceptance`, `src/app/acceptanceSeam.ts`), at the desktop 4:3 product viewport (1024 x 768), a compact laptop viewport (900 x 640), and a phone-sized graceful-degradation viewport (390 x 700).

## Issue 02: Run progression and encounter feedback

- W-cells render as a labeled meter with a stable `current/next` fraction (`34/50`), replacing the prose fraction. At maximum tier the meter fills lime and the fraction slot shows `MAX` with all three tier pips lit; module bounds are unchanged between states.
- Weapon tier renders as three diamond pips. Crossing a tier threshold applies the `is-tier-up` reward flash on the economy module (verified via DOM class 200ms after wCells crossed 0 to 20; pips updated `on`).
- Estimated Scrap sits inside the subordinate economy module in muted steel with a gold value, visually below survival and Run progress.
- Timed powerups render as individual badges (Overclock, Options, Bounty) with glyph, name, and tabular timer. Under 2.5s a badge switches to the dashed amber expiring treatment (shape plus color). Multiple badges remain individually scannable; no joined sentence.
- Boss bar: stable `Colossus` display-face label left, fixed-slot HP fraction right (`1860/3000`), segmented magenta track with 160ms fill transition. Centered above the play path; nothing else stacks with it.
- Large values (score 99,999,999; wave 999; kills 9,999; timers 88s; Scrap ~1M): critical module rects were byte-identical before and after; only the low-priority economy module grew leftward into empty center space (right edge anchored).

Screenshots: `desktop-baseline.png`, `desktop-progression.png`, `powerup-expiring.png`, `tier-max.png`, `desktop-high-values.png`.

## Issue 03: Actionable pause modal

- Escape and P (held across a frame) toggle pause; the Run dims under the modal overlay. Resume is the visually primary action and receives initial focus.
- Focus order Resume, Settings, Restart run, Exit to hangar; Tab/Shift-Tab are trapped in the modal, ArrowUp/ArrowDown also move focus, Enter activates. Gamepad navigation (dpad/stick up-down, A activate, B disarm) is implemented via a poll loop in `PauseModal`; Start continues to resume through the existing command path.
- Destructive protection: first activation of Restart run arms it (`Confirm restart`, dashed magenta); second activation performs it. Same pattern for Exit to hangar. Verified restart via keyboard: world reset to score 0, wave 1, boss and powerups cleared, unpaused, still on the run screen.
- Settings opens from pause and Back returns to the run screen with the Run still paused and the modal showing (`settingsReturn` mechanism in the session store); the Run is not discarded.
- Window blur still auto-pauses (dispatched `blur`, `session.paused` became true, modal appeared).
- Destroyed renders as a distinct magenta `alertdialog` with no actions (no Resume), over the death-tinted overlay.

Screenshots: `pause-modal.png`, `restart-armed.png`, `destroyed.png`.

## Issue 04: Compact layout and run-state transitions

- Desktop 4:3: all clusters fit without clipping or overlap; the persistent survival module starts at y=704 while the movement band boundary ends near y=701; hud-mid content stays above the band.
- Compact (900 x 640, stage 853px wide): intentional container-query composition (`@container stage (max-width: 900px)`) shrinks modules and stacks the kills value under its label so score and kills stay unambiguous. No arbitrary flex wrapping.
- Phone (390 x 700): `@container stage (max-width: 540px)` stacks the bottom row (survival full width, then economy and bombs side by side) and gives the boss bar full width with name left and HP right. No clipped content, overlap, or ambiguous value wrapping. No touch controls added.
- Canvas and stage rects stayed identical at 1024x768 (0,0,1024,768) and 900x640 (23,0,853,640) after live resize.
- Restart and new Run clear pause, Destroyed, boss bar, timed powerups, and counters immediately (verified after confirm-restart and after `startRun` from the Destroyed state). `startRun` also resets transient presentation cues (`resetPresentationFx`).
- Console after launch, pause/resume, resize, restart, and new Run: 0 errors; the only warning is the pre-existing THREE.Clock deprecation documented in the PRD.

Screenshots: `compact-900x640.png`, `phone-390x700.png`, plus the desktop set above.
