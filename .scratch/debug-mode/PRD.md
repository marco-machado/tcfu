# Debug mode

Status: ready-for-agent

## Problem Statement

Testing and tuning the game currently requires playing it for real. To inspect a late-game weapon tier, a specific enemy's behavior, or a set-piece encounter, a developer must survive long enough to reach it. To try the full meta-upgrade tree or a locked ship kit, they must grind Scrap and career best on their own save, permanently polluting real progression data. There is no way to spawn a chosen enemy, grant a powerup, or manipulate player stats on demand, which makes bug reproduction and balance iteration slow and imprecise.

## Solution

A debug mode activated by a `?debug` query param in dev builds. It runs the normal shell flow (title, hangar, upgrade bay, run) against a sandboxed save that starts with maximum Scrap and every ship kit unlocked, and never touches real persistence. A debug run starts with the wave director suspended, and a collapsible side panel gives the developer direct control: spawn any enemy kind or wave pattern, drop any powerup, adjust player stats, control time, jump the wave counter, and visualize hitboxes. A persistent badge makes it unmistakable that the session is sandboxed.

## User Stories

1. As a developer, I want to activate debug mode with a `?debug` query param, so that I can enter a testing session without any build or config changes.
2. As a developer, I want debug mode compiled out of production builds, so that players can never trip into a cheat surface.
3. As a developer, I want debug sessions to run against a sandboxed save, so that my real Scrap, meta ranks, career best, and high scores are never read or modified.
4. As a developer, I want the sandboxed save seeded with enough Scrap to buy the entire meta-upgrade tree, so that I can test every meta rank through the real Upgrade bay.
5. As a developer, I want all ship kits unlocked in the sandboxed save, so that I can test any kit without grinding career best.
6. As a developer, I want debug runs excluded from the high-score list and career best, so that sandboxed play never counts as real progression.
7. As a developer, I want the normal title, hangar, and upgrade-bay flow available in debug mode, so that the menu screens themselves are testable against the sandboxed save.
8. As a developer, I want a persistent DEBUG badge on screen, so that I can never confuse a sandboxed session with my real save.
9. As a developer, I want a debug run to start with the wave director suspended, so that no enemies spawn until I ask for them.
10. As a developer, I want a suspend/resume toggle for the wave director, so that I can hand control back to normal wave choreography at any time.
11. As a developer, I want the wave counter frozen while the wave director is suspended, so that manual spawn testing is not skewed by a silently climbing difficulty curve.
12. As a developer, I want one spawn button per enemy kind (drone, dart, gunner, sidecar, razor, prism, colossus), so that I can field any enemy on demand.
13. As a developer, I want each spawn click to produce one enemy with its canonical archetype stats and path, so that what I test matches what real wave patterns produce.
14. As a developer, I want a debug-spawned colossus to behave as a real set-piece with the boss bar, so that set-piece presentation is testable directly.
15. As a developer, I want spawn buttons to work whether waves are suspended or resumed, so that I can add threats on top of live choreography.
16. As a developer, I want a wave-pattern picker that triggers any authored wave pattern by id, so that I can tune individual patterns without surviving to their playlist band.
17. As a developer, I want one button per powerup type (shield, bomb_stock, repair, rate_up, spread_up, score_mult), so that I can test every pickup effect on demand.
18. As a developer, I want powerup buttons to spawn real falling pickups upstream of the ship, so that the full drop and collect pipeline is exercised.
19. As a developer, I want HP increment/decrement controls, so that I can test damage states and low-health presentation.
20. As a developer, I want lives increment/decrement controls, so that I can test respawn and last-life behavior.
21. As a developer, I want bomb-stock increment/decrement controls, so that I can test bomb usage and capacity limits.
22. As a developer, I want weapon run-upgrade tier increment/decrement controls, so that I can inspect each tier's firing pattern without grinding pickups.
23. As a developer, I want a shield on/off toggle, so that I can test shield visuals and shield-break events.
24. As a developer, I want a god-mode toggle granting sustained invulnerability, so that I can observe dangerous encounters without dying.
25. As a developer, I want a +score button, so that I can test score-driven displays and results without playing for the points.
26. As a developer, I want a suicide button, so that I can reach the death and results flow instantly.
27. As a developer, I want a clear-all button that despawns every enemy and enemy bullet, so that I get a clean slate between spawn experiments.
28. As a developer, I want a time-scale control (0.25x, 0.5x, 1x, 2x), so that I can inspect bullet patterns and FX in slow motion or accelerate waiting.
29. As a developer, I want a single-frame step while paused, so that I can inspect behavior frame by frame.
30. As a developer, I want a jump-to-wave control, so that resuming the wave director lands in a chosen playlist band without playing there.
31. As a developer, I want a sim overlay drawing collision hitboxes and entity counts, so that I can debug collision behavior visually.
32. As a developer, I want the debug panel as a collapsible side panel toggled with the `,` key, so that it stays out of the way while I play.
33. As a developer, I want the panel hidden by the existing hide-debug-UI hook, so that visual-harness captures stay clean.
34. As a developer, I want to buy meta ranks through the real Upgrade bay using sandboxed Scrap, so that the purchase flow itself gets exercised instead of bypassed.

## Implementation Decisions

- Debug mode is gated on both the `?debug` query param and dev-build detection; the entire feature is compiled out of production bundles, matching the existing dev-only test-hooks convention.
- Debug gameplay actions are implemented as pure functions over the authoritative `World` object in a new sim module, the same shape as the existing world-step function. The panel UI is a thin DOM layer that only calls these functions.
- The sandboxed save is implemented inside the single shared storage module: when debug mode is active, reads and writes switch from localStorage to an in-memory backing store seeded with maximum Scrap and all ship kits unlocked. No individual persistence module changes behavior.
- Career best in the sandbox is seeded at or above the highest kit unlock threshold, since kit unlocks are evaluated against career best.
- Debug runs never write to real persistence in any form; high-score submission and career-best recording operate on the sandbox only.
- The wave director gains a suspended flag on the run session. While suspended, no wave-pattern spawning occurs and the wave counter does not advance. Resume returns control to the normal director from its current state.
- Debug enemy spawns reuse the wave catalog's canonical archetype definitions rather than duplicating stats. A colossus spawn goes through the same set-piece path as scheduled set-pieces so the boss bar engages.
- The wave-pattern picker triggers an authored wave pattern by id through the wave director, bypassing playlist-band selection.
- Powerup buttons activate a pooled powerup slot upstream of the player, mirroring how organic drops enter the field.
- Time scale multiplies the sim delta time; frame step advances exactly one fixed step while paused.
- The sim overlay renders hitboxes and entity counts from authoritative sim state; it is a presentation consumer with no sim authority.
- The panel is plain HTML/DOM, not in-canvas 3D UI, and does not need to follow the game's visual identity. It appears only during debug runs, toggles with the `,` key, and is wired to the existing hide-debug-UI test hook.
- The shell flow in debug mode is unchanged: title, hangar, upgrade bay, and runs all operate normally against the sandboxed save, with a persistent DEBUG badge visible.

## Testing Decisions

- Good tests exercise external behavior at the seams: given a `World`, calling a debug action produces observable sim state (an active enemy of the requested kind, a frozen wave counter, a cleared bullet pool), never asserting on internal implementation details or DOM structure.
- The new sim debug-action module gets vitest coverage in the style of the existing sim tests (world stepping, playlist, ship kits): construct a world, apply actions, step, assert on world state.
- Wave-director suspension is tested at the sim seam: suspended worlds spawn nothing and hold the wave counter across many steps; resumed worlds continue normal choreography; jump-to-wave changes which playlist band selects patterns.
- The storage sandbox is tested at the storage seam: with sandbox active, writes do not reach localStorage and reads return seeded values; with sandbox inactive, behavior is unchanged.
- Sandbox seeding is tested against the ship-kit unlock predicate and the meta purchase function: all kits report unlocked, and the full tree is purchasable from seeded Scrap.
- The panel, badge, hotkey, and overlay are verified live in the browser via the existing acceptance seam and the playwright-cli skill, not unit tests.

## Out of Scope

- Debug mode in production builds.
- Instant-apply powerups (modifier-click); pickups spawn as falling drops only.
- Debug controls for meta ranks; the Upgrade bay with sandboxed Scrap covers this.
- Any player-facing cheat or accessibility surface derived from this panel.
- Visual-identity styling for the panel.
- Persisting sandbox state across page reloads.

## Further Notes

- Glossary terms **Debug run** and **Sandboxed save** were added to the domain glossary as part of this design.
- Existing dev-only surfaces (deterministic state hooks and the browser acceptance seam) remain unchanged; the debug panel complements rather than replaces them.
