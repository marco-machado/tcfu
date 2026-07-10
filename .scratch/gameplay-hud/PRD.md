# Gameplay HUD readability pass

Status: `ready-for-agent`

## Problem Statement

During a Run, the HUD exposes the correct combat and progression values, but it presents nearly every value as equally weighted uppercase telemetry. Survival status, Run progress, weapon tier, resources, and secondary statistics compete at the same visual level. Health and lives sit at the extreme lower edge, dynamic counters can shift as values grow, powerup abbreviations are difficult to interpret, and narrow layouts wrap related labels and values into ambiguous lines. The pause overlay dims the Run correctly but only tells the player which key to press; it does not provide an actionable pause menu.

The result is a HUD that stays out of the movement band but reads more like debug output than an authored arcade interface. Players must parse text during high-action moments instead of recognizing stable status clusters, meters, badges, and alerts.

## Solution

Redesign the gameplay HUD as a restrained, genre-specific arcade overlay while preserving its low visual footprint and the existing sim-authoritative state model. Give survival status the strongest hierarchy, keep Run progress and immediate feedback easy to scan, and demote economy and flavor information. Use stable numeric slots, compact authored clusters, meters, badges, icons, and consistent status colors instead of a single line of telemetry.

Keep the HUD outside the player focal area and movement band. Make the desktop 4:3 composition the product target, with intentional fit at supported desktop and laptop widths. Narrow layouts must not produce clipped, overlapping, or ambiguously wrapped information, but this work does not add mobile gameplay or touch controls. Upgrade pause into a clear modal state with Resume as the primary action and appropriate secondary actions, all dispatching existing game intents or shell transitions.

## User Stories

1. As a player in a Run, I want my remaining HP to be the most immediately recognizable HUD value, so that I can react before losing a life.
2. As a player in a Run, I want lives visually grouped with HP but subordinate to immediate health, so that survival state reads as one cluster.
3. As a shielded player, I want shield state to be visually distinct from HP, so that I know which protection will absorb the next hit.
4. As a player who takes damage, I want the survival cluster to react briefly through more than text alone, so that damage remains legible during heavy action.
5. As a player whose shield absorbs a hit, I want feedback distinct from HP damage, so that I understand the outcome without reading a sentence.
6. As a player who loses a life, I want the HUD to update without shifting nearby values, so that the interface remains stable.
7. As a player, I want score to stay visible throughout the Run, so that score-chasing remains central to endless survival.
8. As a player, I want score digits to occupy a stable slot as the value grows, so that the top HUD does not reflow.
9. As a player, I want the current wave to read as Run progress, so that escalating pressure has clear context.
10. As a player, I want kills to remain available without competing with HP, score, or wave, so that secondary performance data does not dominate.
11. As a player, I want bombs displayed as a compact actionable resource, so that I can see panic-tool availability at a glance.
12. As a player with no bombs, I want the empty state to be unmistakable, so that I do not attempt an unavailable action.
13. As a player collecting W-cells, I want progress toward the next run upgrade shown as progress rather than a long fraction inside prose, so that advancement is quickly understood.
14. As a player reaching a new weapon tier, I want a brief reward response, so that the run upgrade feels meaningful.
15. As a player at maximum weapon tier, I want a stable max-state treatment, so that the resource cluster does not change shape.
16. As a player, I want estimated Scrap visually identified as secondary Run economy information, so that it does not compete with immediate combat status.
17. As a player with a timed powerup, I want its effect and remaining duration recognizable without decoding an abbreviation, so that I can use the effect intentionally.
18. As a player with multiple timed powerups, I want each effect to remain individually scannable, so that a joined text sentence does not become ambiguous.
19. As a player when a timed powerup is about to expire, I want a restrained warning state, so that expiration does not surprise me.
20. As a player facing a set-piece enemy, I want the boss bar to remain prominent and centered without obscuring threats, so that encounter progress is clear.
21. As a player, I want set-piece HP changes to read smoothly without moving the boss label, so that the boss bar remains stable.
22. As a player, I want HUD colors to consistently distinguish danger, shield, reward, powerup, and disabled states, so that color has dependable meaning.
23. As a player, I want important statuses to use shape, position, or motion in addition to color, so that meaning is not color-only.
24. As a player, I want the HUD visual language to echo the cold-metal and cyan arcade presentation of the world, so that it feels like part of the game rather than a web dashboard.
25. As a player, I want decorative framing to stay restrained, so that the movement band, threats, projectiles, and pickups remain unobstructed.
26. As a player, I want the player ship and likely threat lanes to remain clear of persistent HUD panels, so that interface polish does not reduce fairness.
27. As a player on the supported desktop 4:3 layout, I want every HUD cluster to fit without clipping or overlap, so that the product target is reliable.
28. As a player on a narrower desktop or laptop window, I want the HUD to switch to an intentional compact composition, so that labels and values remain associated.
29. As a player on an unsupported phone-sized viewport, I want the interface to avoid ambiguous wrapping or clipped content, so that the page fails gracefully even though touch gameplay is not provided.
30. As a player, I want changing score, wave, HP, lives, Scrap, W-cells, and timers to avoid layout shift, so that muscle memory for HUD locations remains useful.
31. As a player, I want text to remain legible over dark scenery, bright effects, and moving threats, so that contrast is dependable throughout a Run.
32. As a player, I want the pause state to clearly stop and dim the Run, so that modal state is unmistakable.
33. As a paused player, I want Resume to be the primary action, so that returning to the Run is immediate.
34. As a paused player, I want keyboard and gamepad pause controls to resume the Run, so that existing controls remain consistent.
35. As a paused player, I want Settings available as a secondary action, so that I can adjust presentation without abandoning the Run.
36. As a paused player, I want restart or exit actions to be clearly secondary and protected from accidental activation, so that I do not discard a Run unintentionally.
37. As a keyboard player, I want visible focus and pressed states on pause actions, so that navigation is understandable without a pointer.
38. As a player when the Run ends, I want the Destroyed state to remain visually distinct from pause, so that I understand the Run is terminal.
39. As a player restarting or beginning a new Run, I want every HUD value and temporary status to reset immediately, so that stale information never carries across Runs.
40. As a developer, I want the HUD to read existing authoritative Run state rather than recreate combat or progression rules, so that presentation cannot diverge from the sim.
41. As a developer, I want HUD actions to dispatch existing game intents and shell transitions, so that the interface does not mutate unrelated simulation internals.
42. As a developer, I want a single browser-level acceptance seam around the rendered Run screen, so that behavior and layout can be verified without coupling tests to React or CSS internals.

## Implementation Decisions

- Preserve the current sim, view, and shell authority boundaries. The HUD reads the current world and session state; it does not calculate combat outcomes or become a second source of truth.
- Retain desktop 4:3 as the primary product layout. Add an intentional compact layout for narrower viewports, but do not introduce touch controls or claim mobile gameplay support.
- Organize persistent HUD information into four hierarchy levels: survival/status first; Run objective and progress second; immediate feedback and temporary effects third; economy and flavor fourth.
- Replace the flat telemetry lines with authored clusters. Survival uses an HP meter or discrete durable pips, lives and shield have dedicated slots, bombs use a compact actionable badge, and W-cell progress uses a meter or stable progress treatment.
- Keep score and wave prominent. Keep kills and estimated Scrap available but visually subordinate.
- Use fixed-width or minimum-width numeric containers and tabular numerals for dynamic counters. Values must not move neighboring clusters as digit counts change.
- Give each timed powerup a separate stable item with an understandable short label or icon plus duration. Do not rely on unexplained abbreviations alone.
- Use a limited semantic palette with consistent roles for danger, shield, reward, objective, powerup, and disabled states. Critical meaning must also be conveyed through shape, label, position, or restrained motion.
- Preserve the boss bar concept for set-piece encounters. Its label and track remain stable as HP changes, and it must not stack with another large banner over the play path.
- Keep all persistent HUD clusters outside the movement band and likely threat lanes. Decorative panels must remain compact and translucent or restrained enough to preserve combat readability.
- Add explicit compact-layout rules instead of allowing arbitrary flex wrapping. Related labels and values remain atomic; if information must be reduced, secondary information compresses or moves before survival and Run progress.
- Account for viewport edge padding. Supported desktop layouts must keep content away from physical screen edges; phone-sized graceful degradation must avoid clipping even though mobile safe areas and touch interaction remain out of scope.
- Upgrade pause from an instruction-only panel to an actionable modal. Resume is primary; Settings is secondary; restart and exit may be included as clearly secondary destructive actions consistent with existing shell capabilities.
- Pause actions support keyboard and gamepad navigation, visible focus, hover where applicable, pressed, and disabled states. Existing Escape, P, and Start behavior remains available.
- Destructive pause actions require an intentional confirmation pattern or equivalent protection from accidental activation.
- Preserve the distinct terminal Destroyed overlay and Results transition. Pause and Run-end states must not share ambiguous copy or actions.
- Drive short HUD reactions from existing state and presentation-event mechanisms where appropriate. Do not infer combat outcomes independently from rendering or DOM differences.
- Avoid adding generated logos, illustrations, or 3D UI props. The desired quality can be achieved with existing typography, CSS geometry, meters, badges, and small code-native icons.
- The implementation may restructure the HUD module and its styles, but should not expand combat rules, progression formulas, persistence schemas, or world-state contracts solely for presentation convenience.

## Testing Decisions

- A good test asserts external player-visible behavior: which information appears for a given Run state, whether actions change modal state correctly, and whether the rendered composition fits at representative viewports. Tests must not assert internal React component structure, class names, individual CSS declarations, or implementation-specific animation frames.
- Use one primary browser-level seam around the rendered Run screen. This is the highest available seam and covers live state wiring, pause interactions, responsive composition, and the relationship between canvas framing and HUD placement.
- At the browser seam, establish representative Run states for baseline gameplay, damaged HP, shielded status, zero bombs, large score and resource values, multiple timed powerups, a set-piece boss bar, maximum weapon tier, pause, Destroyed, and reset/new Run.
- Verify the desktop 4:3 product viewport and at least one narrower desktop/laptop viewport. Include a phone-sized viewport only as a graceful-degradation check: no clipping, overlap, or ambiguous value wrapping is required, but touch playability is not.
- Verify stable layout with long and high values. Changing score digit count, wave, lives, Scrap estimate, W-cell threshold, shield text, and powerup timers must not reposition critical clusters unexpectedly.
- Verify that persistent HUD content does not overlap the movement band, player focal area, boss bar, or pause modal at the tested viewports.
- Verify that pause can be entered and resumed with existing keyboard controls, that Resume is the primary modal action, that keyboard focus is visible, and that any destructive action is protected.
- Verify that restarting or beginning a new Run clears temporary powerups, boss state, pause state, and stale counters.
- Capture desktop gameplay, compact-layout gameplay, set-piece, pause, and Destroyed screenshots as acceptance evidence. Screenshot capture supports human review; brittle pixel-perfect snapshots are not required.
- Check browser console output after launch, pause/resume, resize, and restart. This work must introduce no new runtime errors or HUD-related warnings.
- Existing sim tests remain the prior art for authoritative state transitions. Do not duplicate those rules in HUD tests; browser tests consume controlled state and assert only presentation and interaction behavior.
- The accepted seam is the rendered Run screen in a real browser, confirmed with the user before publication.

## Out of Scope

- Mobile or touch gameplay, virtual sticks, touch action buttons, notch-specific safe-area certification, and orientation support.
- Changes to combat balance, scoring, Scrap formulas, W-cell thresholds, run upgrades, meta upgrades, wave patterns, set-piece scheduling, or ship-kit stats.
- Changes to the world stream, movement band dimensions, camera, procedural meshes, materials, VFX, audio, or rumble except for existing presentation signals consumed by the HUD.
- A minimap, mission system, campaign objective UI, inventory system, or new game mode.
- Production image assets, generated GUI art, logos, faction marks, menu backgrounds, or diegetic 3D UI.
- Full accessibility settings, localization infrastructure, input rebinding, or a new settings schema. The HUD should avoid blocking future work in these areas.
- Pixel-perfect visual regression infrastructure or WebGL frame assertions.
- Redesigning Title, Hangar, Upgrade bay, Results, High Scores, or Settings beyond the navigation needed from the pause modal.

## Further Notes

- Domain language follows the project glossary: **Run**, **movement band**, **world stream**, **powerup**, **run upgrade**, **Scrap**, **set-piece**, and **boss bar**.
- The audit found that desktop placement is unobtrusive and contrast is generally readable over the dark scene. Those strengths should be preserved.
- The current narrow layout keeps content technically within the HUD bounds but wraps related values into separate visual lines. Passing fit requires semantic association and scanability, not merely the absence of horizontal overflow.
- The existing pause state was verified through the live Run state. The new modal should preserve automatic pause on window blur.
- The browser audit produced no application errors. An existing Three.js clock deprecation warning is unrelated to this specification.
- Success means a player can recognize survival status, Run progress, bombs, weapon progression, temporary powerups, and set-piece health in priority order without reading a telemetry sentence, while the movement band remains clear.
