# Shared menu-focus owner for non-combat UI

Status: accepted
Date: 2026-07-15

Non-combat UI (Title, Hangar, Upgrade Bay, Results, High Scores, Settings, and run overlays such as Pause) is driven by one shared menu-focus owner (a focus scope / hook), not per-screen copies of PauseModal’s local ref list. Keyboard and gamepad share that model: arrows and Tab move along a DOM-order focus ring with wrap; Enter / Space / A activate; Esc / B cancel nested arming or confirm first, then leave to the screen’s parent (Title no-op; Hangar and High Scores → Title; Upgrade Bay → Hangar; Results → Hangar; Settings → `settingsReturn`; Pause resumes, with B clearing arming first). Initial focus is the screen’s primary action. Disabled controls stay in the ring but do not activate. Click/tap focuses then activates. Settings composites use Up/Down between rows and Left/Right to edit the focused control (Segmented is one focusable, not one stop per option). Audio: `ui_move` on focus or value moves, `ui_confirm` on committing activates. Extra letter/digit hotkeys are out of scope. Run combat HUD stays on `src/input` command sampling; menu focus does not own the keyboard during active play.

This keeps couch and keyboard play consistent with Pause, avoids drift from duplicated focus loops, and leaves session/sim state free of DOM focus indices. Screens declare a root and back behavior; UI primitives own value-edit semantics.

Rejected alternatives: accessibility-only Tab order without arcade roving or gamepad parity (insufficient for controller play); spatial 2D grid navigation (unnecessary at current screen density); per-screen reimplementation of Pause’s focus loop (high drift); session-store focus ids (couples domain state to DOM); letter/digit hotkeys as a parallel layer (duplicates the focus model and ages poorly); excluding disabled controls from the ring (hides progression info on locked ships and maxed branches).
