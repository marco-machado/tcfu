# Menu focus for non-combat UI

Status: `ready-for-agent`

## Problem Statement

Players can finish a Run and drive combat with keyboard or gamepad, but most out-of-combat screens still assume a pointer. Only the pause overlay has arcade-style focus cycling. On Title, Hangar, Upgrade Bay, Results, High Scores, and Settings, keyboard and pad users cannot reliably move between controls, activate the primary action, or leave a screen without a mouse. That breaks couch play and keyboard-only play for ship selection, Scrap spending in the Upgrade bay, debrief continue paths, and settings.

## Solution

Introduce one shared menu-focus owner for all non-combat UI. Keyboard and gamepad share a DOM-order focus ring with wrap: move, activate, and context-sensitive back. Screens open on their primary action. Settings rows edit with Left/Right while Up/Down change rows. Disabled controls remain reachable for discovery but do not activate. Combat command sampling during an active Run is unchanged. Letter and digit hotkeys are not added.

This matches the accepted decision in ADR 0008 (shared menu-focus owner for non-combat UI).

## User Stories

1. As a keyboard player on Title, I want focus on Play when the screen opens, so that one activate starts the path toward a Run.
2. As a keyboard player on Title, I want Up/Down or Tab to move among Play, High Scores, and Settings, so that I can reach every title action without a pointer.
3. As a keyboard player on Title, I want Enter or Space to activate the focused control, so that selection matches ordinary menu expectations.
4. As a keyboard player on Title, I want Esc to do nothing, so that I am not ejected from the main menu.
5. As a gamepad player on Title, I want D-pad or left stick to move focus and A to activate, so that couch play matches keyboard menus.
6. As a gamepad player on Title, I want B to do nothing when there is no parent screen, so that I am not surprised by a no-op or a wrong transition.
7. As a keyboard player on Hangar, I want focus on Launch when the screen opens, so that I can start a Run immediately with the currently selected ship kit.
8. As a keyboard player on Hangar, I want to move focus through ship cards (including locked kits) and the footer actions (Launch, Upgrade bay, Back) in DOM order, so that the full hangar is reachable.
9. As a keyboard player focused on an unlocked ship card, I want Activate to select that ship kit, so that I can change kit before Launch.
10. As a keyboard player focused on a locked ship card, I want to read unlock requirements without Activate doing anything, so that progression goals stay visible and safe.
11. As a keyboard player on Hangar, I want Esc to return to Title, so that Back is available without focusing the Back control.
12. As a gamepad player on Hangar, I want the same ring and Back semantics with D-pad/stick, A, and B, so that hangar setup works on the couch.
13. As a keyboard player on Upgrade bay, I want focus on the primary install action when the screen opens, so that spending Scrap is one activate away when affordable.
14. As a keyboard player on Upgrade bay, I want to focus each branch’s install control even when disabled (insufficient Scrap or maxed), so that I can see cost and rank state.
15. As a keyboard player on Upgrade bay, I want Activate on an enabled Install to purchase the next meta rank, so that meta progression works without a pointer.
16. As a keyboard player on Upgrade bay, I want Esc to return to Hangar, so that leave matches the existing Back path.
17. As a keyboard player on Results (debrief), I want focus on Quick retry when the screen opens, so that another Run is the fastest action after death.
18. As a keyboard player on Results, I want to move among Quick retry, Hangar, High Scores, and Title, so that every debrief exit is reachable.
19. As a keyboard player on Results, I want Esc to go to Hangar, so that the natural career continue path is available without a pointer.
20. As a keyboard player on High Scores, I want focus on Back when the screen opens, so that leaving the leaderboard is immediate.
21. As a keyboard player on High Scores, I want Esc to return to Title, so that leave matches Back.
22. As a keyboard player on Settings, I want focus on Back when the screen opens (primary leave action for this screen), so that exit is the default target after a glance.
23. As a keyboard player on Settings, I want Up/Down (and Tab) to move among setting rows and danger actions in DOM order, so that every control is reachable.
24. As a keyboard player focused on Quality (Segmented), I want Left/Right to change the quality option without leaving the row, so that video quality is editable like a game settings list.
25. As a keyboard player focused on a Toggle, I want Left/Right and/or Activate to flip the value, so that autofire, motion, and shake are adjustable without a pointer.
26. As a keyboard player focused on a Slider, I want Left/Right to nudge Master, Music, or SFX, so that volumes are adjustable from the pad or keyboard.
27. As a keyboard player on Settings, I want Segmented to be a single focus stop (not one stop per option), so that vertical navigation stays one row per setting.
28. As a keyboard player on Settings opened from Title, I want Esc/B or Back to return to Title via the stored return screen, so that leave is hierarchical.
29. As a keyboard player who opened Settings from pause during a Run, I want Esc/B or Back to return to the still-paused Run, so that I do not silently discard or unpause the Run.
30. As a keyboard player in Pause, I want focus on Resume when the modal opens, so that continuing the Run is the default.
31. As a keyboard player in Pause, I want arrows/Tab to move among Resume, Settings, Restart, and Exit, so that every pause action is reachable (preserving current behavior under the shared owner).
32. As a keyboard player in Pause, I want the first Activate on Restart or Exit to arm confirmation and a second Activate to commit, so that I do not discard a Run by accident.
33. As a keyboard player in Pause with a destructive action armed, I want Esc or B to clear arming only, so that back is two-phase and safe.
34. As a keyboard player in Pause with nothing armed, I want Esc/P (existing run input) and B to resume, so that leave from pause continues the Run.
35. As a gamepad player in Pause, I want the same move/activate/back model as keyboard, so that pause stays couch-complete under the shared owner.
36. As a player using Tab, I want Tab and Shift+Tab to walk the same ring as arrows, including wrap, so that desktop keyboard habits work.
37. As a player at either end of a menu, I want focus to wrap (last to first and reverse), so that menus feel like arcade lists rather than clamped forms.
38. As a player who clicks or taps a control, I want that control to become focused and activate as usual, so that pointer and focus stay aligned for the next key or pad input.
39. As a player moving focus, I want a light `ui_move` tick, so that selection changes are audible.
40. As a player changing a setting value with Left/Right, I want `ui_move` feedback, so that value edits match existing settings change feel.
41. As a player activating a committing action (navigate, launch, buy, confirm), I want `ui_confirm` where appropriate, so that accepts are distinct from moves.
42. As a player mid-Run (not paused on a menu), I want WASD, fire, bomb, and pause bindings to keep driving combat commands, so that menu focus never steals the playfield.
43. As a maintainer, I want one shared menu-focus owner instead of per-screen Pause copies, so that wrap, back, and pad edge rules do not drift.
44. As a maintainer, I want session and sim state free of DOM focus indices, so that menu focus stays a view concern.
45. As a maintainer, I want screens to declare only a focus root, primary target, and back behavior, so that wiring a new non-combat surface stays small.
46. As a maintainer, I want UI primitives to own Left/Right value semantics, so that Settings composites stay consistent wherever they appear.
47. As a player, I do not need letter or number hotkeys for menus, so that there is one navigation model to learn.
48. As a player on the Destroyed overlay, I do not need a focus ring, so that auto-advance to Results is not interrupted by menu navigation work.
49. As a developer using the debug panel, I do not need menu-focus integration in this work, so that DEV tooling stays out of the player path.

## Implementation Decisions

- **ADR 0008 is binding.** Shared menu-focus owner; non-combat scope; keyboard and gamepad parity; DOM-order ring with wrap; primary-action initial focus; disabled included; minimal hybrid shortcuts; Settings axis split; audio; hierarchical back map with two-phase cancel.
- **Shared owner.** One menu-focus scope (hook or small view module) collects focusables under a root, handles move/activate/back, gamepad edge sampling, initial focus on mount, and `ui_move` on focus changes. Pause migrates onto this owner instead of keeping a private implementation.
- **Screen responsibilities.** Each non-combat screen (and Pause) mounts the owner with: focus root, which control is the primary action, and `onBack` (or equivalent) implementing the parent map. Focus order is intentional markup/DOM order, not spatial geometry.
- **Back map.** Title: no-op. Hangar → Title. Upgrade bay → Hangar. High Scores → Title. Results → Hangar. Settings → stored return screen (`title` or `run`; run remains paused when return is run). Pause: cancel arming if active; else resume (Esc/P remain on the existing run input path; B clears arming then resumes).
- **Activate.** Enter, Space, and gamepad A invoke the focused control’s normal activation when enabled; no-op when disabled.
- **Settings composites.** Up/Down and Tab move between rows. Left/Right edit the focused Segmented, Toggle, or Slider. Segmented is one focusable radiogroup stop; options change via Left/Right (and pointer), not separate tab stops per option. Toggle flips on Activate and/or Left/Right. Slider nudges on Left/Right within min/max.
- **Pointer.** Click/tap uses normal control behavior and leaves focus on the target so the next key/pad move continues from there. No hover-to-focus.
- **Audio.** `ui_move` on focus ring moves and on value tweaks; `ui_confirm` on committing activates (aligned with existing play SFX helpers and user volume settings).
- **Run boundary.** Combat command sampling stays the sole owner of play keys during active Run. Menu owner is active on non-combat screens and pause overlay; it must not redefine mid-run movement/fire/bomb.
- **No session focus state.** Do not store focused control ids in the session store or sim.
- **No letter/digit hotkeys** in this feature.
- **Settings data resets** may keep the existing browser `confirm` dialogs; do not redesign them into Pause-style arming unless required for focus safety.
- **Glossary.** No new domain glossary terms required; this is interaction architecture documented by ADR 0008.

## Testing Decisions

- **What makes a good test:** assert external behavior of the menu-focus policy and composite value editing (where focus goes, whether activate fires, whether back cancels or leaves, whether Left/Right changes a value). Do not assert private React refs, rAF poll structure, or class names.
- **Primary seam: menu-focus policy core.** Extract or expose a pure policy API used by the shared owner (move by delta with wrap; activate eligibility for disabled; back phases: cancel nested arming vs hierarchical leave; mapping of logical intents move/activate/back). Unit-test that core with vitest. Keyboard and gamepad adapters both call this policy so pad edge detection need not be re-tested per screen.
- **Secondary seam: Settings composites.** Thin tests (or focused interaction tests) that Segmented, Toggle, and Slider change value on Left/Right when exercised through their public control surface, and that Segmented exposes a single focus stop for row navigation purposes.
- **Not primary seams:** full RTL mounts of every screen; session store; sim; combat input module (except ensuring menu work does not change active-run command sampling responsibilities).
- **Manual / harness smoke (lightweight):** wire-up check that each non-combat screen and Pause mounts the owner and lands on the primary action; use existing dev acceptance hooks if helpful. Not a large new browser suite requirement for v1.
- **Prior art:** vitest unit tests alongside modules (e.g. small pure helpers under app UI); PauseModal’s current keyboard/gamepad behavior is the behavioral reference for Pause migration; existing `ui_move` / `ui_confirm` audio helpers for sound side effects (assert via policy hooks or thin fakes if needed, not Web Audio internals).
- **No new test framework** required beyond vitest unless the repo already adopts another for DOM; prefer pure policy tests over heavy DOM harnesses.

## Out of Scope

- Spatial 2D grid focus navigation.
- Letter or digit menu hotkeys.
- Focus-driving the combat Run HUD (bomb, pause button as a full menu ring mid-play).
- Destroyed overlay focus work.
- Debug panel menu-focus integration.
- Redesign of Settings reset confirmation UX beyond making controls reachable.
- Session-persisted “remember last focused control per screen.”
- Changing combat bindings or `src/input` command meanings.
- Visual redesign of focus rings beyond using existing focus-visible treatment as needed for correctness.

## Further Notes

- Acceptance criteria for implementers should trace to ADR 0008 and this PRD’s user stories; when Pause is migrated, behavior must remain at least as safe as today’s double-activate destructive actions and gamepad press/release arming that prevents hold-through leakage into gameplay.
- Parent map for Results is Hangar (not Title), matching the career continue path.
- Initial focus is primary action everywhere, including Hangar Launch (not the selected ship card) and Settings Back, per product decision during grilling.
- Issue tracker home: this file under `.scratch/menu-focus/`. Split into implementation issues only if an agent or human wants thinner slices; the PRD alone is `ready-for-agent` as a single coherent feature.

## Comments

### Agent Brief

> *This was generated by AI during triage.*

**Category:** enhancement
**Summary:** Give all non-combat screens keyboard + gamepad focus navigation via one shared menu-focus owner, per ADR 0008.

**Current behavior:**
Only the Pause overlay supports arcade focus cycling; it carries its own private keyboard listener, `navigator.getGamepads()` rAF poll with edge detection, ref-list focus ring, and two-phase destructive-action arming. The six other non-combat screens (Title, Hangar, Upgrade Bay, Results, High Scores, Settings) have no keyboard or gamepad focus handling at all, so keyboard-only and couch/pad players cannot move focus, activate the primary action, or leave those screens without a pointer. Combat during an active Run is already driven by `src/input` command sampling and is correct.

**Desired behavior:**
Implement the shared menu-focus owner described in ADR 0008 and this PRD. A single owner (hook or small view module) collects focusables under a declared root and handles: initial focus on the screen's primary action; move along a DOM-order ring with wrap via arrows, Tab, Shift+Tab, D-pad, and left stick; activate via Enter, Space, and gamepad A (no-op on disabled but still-focusable controls); and context-sensitive back via Esc and gamepad B following the parent map. Pause migrates onto this owner and must stay at least as safe as today (two-phase arming for Restart/Exit; B/Esc clears arming before leaving; press/release edge sampling so a held button cannot leak into gameplay). Settings composites navigate rows with Up/Down and Tab and edit the focused control with Left/Right, with Segmented exposing exactly one focus stop. `ui_move` fires on focus-ring moves and value tweaks; `ui_confirm` on committing activates. No letter/digit hotkeys. Menu focus must never own the keyboard during an active Run.

**Back map** (from ADR 0008): Title no-op; Hangar, High Scores, Results all leave to their parent (Hangar and High Scores to Title, Results to Hangar); Upgrade Bay to Hangar; Settings to its stored return screen; Pause resumes (B clears arming first).

**Key interfaces:**
- Session store `settingsReturn: ScreenId` with `openSettings(returnTo)` / `closeSettings()` — the owner's Settings back must route through the existing stored-return value (Title, or the still-paused Run) rather than a new mechanism; leaving Settings opened from pause must not unpause the Run.
- `SfxType` (already includes `'ui_move'` and `'ui_confirm'`) — the owner emits these through the existing SFX bus honoring user volume settings; do not touch Web Audio internals.
- A pure menu-focus policy API is the primary seam: move-by-delta with wrap, activate eligibility (disabled excluded), and back phases (cancel nested arming vs hierarchical leave), expressed over logical intents (move / activate / back). Keyboard and gamepad adapters both call this one policy.
- Per-screen wiring stays minimal: each screen declares a focus root, its primary-action target, and back behavior. No focused-control ids in session or sim state.
- UI primitives `Segmented`, `Toggle`, `Slider` own their Left/Right value-edit semantics so Settings composites stay consistent.

**Acceptance criteria:**
- [ ] Each of Title, Hangar, Upgrade Bay, Results, High Scores, Settings, and Pause mounts the shared owner and lands initial focus on its primary action (Hangar → Launch, not the selected ship card; Settings → Back; Results → Quick retry; Pause → Resume).
- [ ] Arrows, Tab/Shift+Tab, D-pad, and left stick all move focus along the same DOM-order ring and wrap at both ends; Enter/Space/A activate the focused enabled control and no-op on disabled ones.
- [ ] Locked ship cards and disabled Upgrade Bay install controls remain focusable (cost/rank/unlock info readable) but do not activate.
- [ ] Back follows the ADR 0008 parent map for every screen; Settings back uses `settingsReturn` and keeps the Run paused when the return screen is the Run; Title back is a no-op.
- [ ] In Settings, Up/Down and Tab move between rows; Left/Right edit the focused Segmented, Toggle, or Slider; Segmented is a single focus stop (not one per option).
- [ ] Pause under the shared owner keeps two-phase arming for Restart/Exit, B/Esc clears arming before resuming, and gamepad press/release edge handling prevents hold-through into gameplay.
- [ ] Click/tap focuses the target and activates normally, leaving focus there for the next key/pad move; no hover-to-focus.
- [ ] `ui_move` plays on focus moves and value tweaks; `ui_confirm` on committing activates.
- [ ] During an active Run (not paused), WASD/fire/bomb/pause still drive combat via `src/input`; the menu owner does not redefine mid-run command sampling.
- [ ] Vitest unit tests cover the pure policy core (wrap, disabled-activate eligibility, back phases) and that Segmented/Toggle/Slider change value on Left/Right through their public surface.

**Out of scope:**
- Spatial 2D grid focus navigation; letter/digit menu hotkeys.
- Focus-driving the combat Run HUD; Destroyed overlay focus; debug-panel focus integration.
- Redesigning Settings reset confirmation UX (existing browser `confirm` dialogs may stay); visual redesign of focus rings beyond existing focus-visible treatment.
- Session-persisted "remember last focused control per screen"; changing `src/input` command meanings.
