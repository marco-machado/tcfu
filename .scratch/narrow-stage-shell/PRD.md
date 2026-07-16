# Narrow-stage shell and Run HUD legibility

Status: `resolved`

## Problem Statement

Phone-class stage widths (about 375 CSS pixels wide, portrait height around 812) currently fail several player-visible contracts that desktop already meets. Screenshot audit of the design capture set proved:

- During a Run, the wave cluster clips or fully hides the current wave index, so Run progress is not legible.
- On Hangar, the kit preview and ship-kit list consume the first screenful; Launch, Upgrade bay, Back, and often the locked Phantom card sit below the fold with no sticky primary path.
- On Upgrade bay, the four meta-upgrade branches and Back to Hangar do not fit the first screenful; Thrusters and the exit control are easy to miss.
- Title still shows a keyboard-only control legend on a phone-class stage.
- High Scores prints raw ship-kit ids (`aegis`) instead of display names (`Aegis`).

Brand color, deep-space presentation, and UI primitives already match visual identity. The gap is responsive shell and HUD layout plus a few copy inconsistencies, not a new art direction.

## Solution

Make every top-level shell screen and the in-Run HUD meet a clear **first-paint and legibility contract** at phone-class stage width, without changing combat rules, Scrap economy, or visual identity tokens.

Concretely:

1. Keep the wave index fully legible in the Run HUD wave cluster at phone-class width.
2. Put Hangar’s full ship-kit roster and primary actions (Launch first) on the first screenful, or provide an equivalent always-reachable primary path that does not require discovering scroll.
3. Put all four meta-upgrade branches and Back to Hangar on Upgrade bay’s first screenful, or keep them reachable without losing orientation.
4. Show platform-appropriate control help on Title for phone-class stages.
5. Show ship-kit display names on High Scores.

Verify everything through the existing browser acceptance seam only: drive controlled states, set representative stage widths, assert player-visible outcomes. No new test harness.

## User Stories

1. As a player on a phone-class stage during a Run, I want the current wave index fully visible in the wave cluster, so that I know how far I have progressed.
2. As a player on a phone-class stage during a Run, I want the wave label and wave index to stay associated, so that I do not mistake an empty meter for missing progress.
3. As a player on desktop during a Run, I want wave, score, and survival clusters to remain at least as legible as today, so that fixing narrow layouts does not regress the product target.
4. As a player on a phone-class stage during a Run, I want intentional HUD condensation (hiding secondary kills, graze, or Scrap estimate) to remain allowed, so that survival and wave progress keep priority.
5. As a player on a phone-class stage during a Run, I want condensed secondary stats never to clip mid-glyph when they are shown, so that partial digits never appear.
6. As a player opening Hangar on a phone-class stage, I want Launch available on the first screenful without hunting, so that I can start a Run immediately.
7. As a player on Hangar, I want Launch to remain the primary action visually and in focus order, so that the pre-run path stays obvious.
8. As a player on Hangar, I want Upgrade bay reachable without confusion, so that I can spend Scrap before launch.
9. As a player on Hangar, I want Back to Title available, so that I can leave without launching.
10. As a player on Hangar, I want every ship kit in the roster represented on first paint or with a clear, short scroll that still shows selection state, so that locked kits like Phantom are not invisible.
11. As a player on Hangar, I want the active ship-kit preview and selected-kit stats to remain understandable, so that layout compression does not erase identity.
12. As a player with a locked ship kit, I want unlock requirements still visible, so that career-best goals stay clear.
13. As a player opening Upgrade bay on a phone-class stage, I want all four meta-upgrade branches (Arsenal, Hull, Salvage, Thrusters) present without one branch being cut off mid-card, so that progression options are complete.
14. As a player on Upgrade bay, I want each branch’s rank, installed effect, next install, and Scrap cost still readable after compression, so that purchase decisions stay informed.
15. As a player on Upgrade bay, I want Back to Hangar available without long discovery scroll, so that I can return to launch.
16. As a player with enough Scrap, I want install actions still operable after layout changes, so that meta ranks remain purchasable.
17. As a player with insufficient Scrap, I want shortfall or disabled install affordances still clear, so that I understand why I cannot buy.
18. As a player on Title at phone-class width, I want control help that matches touch or coarse-pointer play rather than only WASD/keyboard, so that the first screen does not lie about input.
19. As a player on Title at desktop width, I want keyboard (and existing) control help preserved, so that desktop onboarding stays accurate.
20. As a player opening High Scores, I want each row’s ship column to show the ship-kit display name, so that the board matches Hangar language.
21. As a player with mixed kits on the board (Vanguard, Striker, Aegis, Phantom), I want every display name correct, so that ids never leak into player-facing UI.
22. As a player on High Scores with no entries, I want the empty state unchanged in meaning, so that layout work does not invent a false board.
23. As a player on Debrief, Settings, or other shell screens at phone-class width, I want no new clipping of primary actions introduced by this work, so that fixes stay localized.
24. As a player with reduced motion enabled, I want layout fixes not to depend on motion, so that meaning remains in position and type.
25. As a player using keyboard or gamepad menu focus on Hangar and Upgrade bay, I want focus order to still reach primary and back actions after reflow, so that non-pointer play remains usable.
26. As a player, I want Scrap, career best, and meta ranks to keep their existing meaning and persistence, so that this work is presentation and layout only.
27. As a player, I want deep-space void presentation and Corridor Signal color roles preserved, so that responsive fixes do not reintroduce trench chrome or wrong semantics.
28. As a developer, I want one browser acceptance seam to prove the contracts, so that tests do not couple to CSS selectors or React trees.
29. As a developer, I want controlled Hangar, Upgrade bay, Title, High Scores, and Run states driven through existing session and test hooks, so that fixtures stay deterministic.
30. As a developer, I want representative desktop and phone-class stage widths in that seam, so that narrow regressions are caught without claiming full device lab coverage.
31. As a designer reviewing captures, I want fixed layouts to make honest first-paint screenshots possible, so that design docs no longer document broken fold states as normal.
32. As a maintainer, I want no new parallel layout system or primitive library rewrite, so that this stays a targeted shell and HUD pass on existing primitives.
33. As a maintainer, I want sim scoring, Scrap formulas, unlock thresholds, and meta rank costs untouched, so that layout work cannot change economy or progression math.
34. As a player on phone-class Run, I want pause and destroyed overlays still reachable and distinct if shown, so that HUD cluster fixes do not break modal chrome.
35. As a player who scrolls intentionally on Hangar or Upgrade bay after content legitimately exceeds one screen, I want scroll to be an enhancement rather than the only way to find Launch or Thrusters, so that first-run usability holds.

## Implementation Decisions

- **Scope is shell and HUD presentation at narrow stage widths.** Do not change sim combat, wave playlist rules, Scrap earn or spend formulas, ship-kit unlock thresholds, meta rank effects, or persistence schemas.
- **Preserve visual identity and the UI primitive library.** Continue composing screens from existing primitives (Panel, Button, ScreenHeader, Chip, Meter, PipRow, and so on). Do not reintroduce ad-hoc parallel button or panel systems. Do not retokenize the palette.
- **Phone-class stage means the stage container at roughly 375×812 CSS pixels** (or the existing max-width container breakpoints already used for shell reflow). Desktop product layout remains the wider stage target already used in design captures (~1280×800). Prefer the project’s existing container-query approach over user-agent sniffing.
- **Run HUD wave cluster:** the wave index must be fully visible and associated with the wave label at phone-class width. Prefer adjusting cluster min/max width, padding, type scale, or heading layout so the value cannot overflow a clipped panel. Secondary condensation already in place (hiding kills, graze, Scrap estimate on narrow stages) may remain; do not “fix” condensation by stuffing every desktop stat back onto the phone HUD.
- **Hangar first paint:** Launch must be available without discovery scroll. Prefer compressing the kit preview height, tightening ship cards, and/or sticky or always-visible action row over forcing a long document scroll. The full roster of ship kits, including locked Phantom, must be representable without being cut mid-card as the only available view.
- **Upgrade bay first paint:** all four meta-upgrade branches and Back to Hangar must be complete and operable without one branch truncated mid-panel. Prefer reduced card min-heights, denser rank rails, or a compact stacked layout over dropping a branch.
- **Title control legend:** choose help copy from stage width and/or pointer capability so phone-class stages do not claim keyboard-only controls as the only truth. Desktop keeps keyboard-oriented help. Do not implement a full rebinding UI.
- **High Scores ship column:** render ship-kit display names from the same catalog source Hangar uses. Do not pretty-print by ad-hoc string replace of ids in multiple places if a single catalog lookup already exists; reuse it.
- **Authority boundaries stay intact.** HUD and screens read session and world state; they do not invent Scrap, unlock, or wave rules. Menu focus ownership (ADR 0008) remains the single owner for non-combat focus; layout changes must not break focus traversal to primary and back actions.
- **No new capture pipeline required for done.** Updating `docs/design/screenshots` is optional evidence, not a merge gate. The acceptance gate is the browser seam behavior, not pixel diffs.
- **No new ADR expected** unless implementation discovers a lasting architectural rule (for example a formal stage-width product matrix). If so, record it separately; this PRD does not mandate one.

## Testing Decisions

- **What makes a good test:** assert external player-visible behavior for a controlled state at a stated stage width. Do not assert class names, specific CSS properties, React component trees, animation frames, or exact pixel buffers.
- **Single seam:** the existing browser acceptance surface already used by the project:
  - Named Run/test hooks for active-play (and related) states.
  - Session store via the acceptance seam for Title, Hangar, Upgrade bay, High Scores (and other shell screens if needed).
  Drive those seams; set the stage to desktop and phone-class widths; observe DOM text and geometry outcomes (element fully in the stage viewport, no clipped mid-glyph for required values, primary actions present and enabled).
- **Do not add a second harness** (no new global, no mandatory Playwright suite, no committed image baselines) unless the existing seam is proven insufficient; if insufficient, stop and report rather than inventing a parallel system.
- **Cases at phone-class stage width:**
  - Run active-play: wave index text fully visible inside the wave cluster (and matches world wave).
  - Hangar with multiple unlocked kits plus one locked kit: Launch visible in the first screenful; all roster cards complete; Upgrade bay and Back reachable without losing the primary path.
  - Upgrade bay with baseline ranks and enough Scrap to show install affordances: all four branches complete; Back to Hangar reachable.
  - Title: control legend does not present keyboard-only instructions as the sole help when the stage is phone-class.
  - High Scores with mixed ship-kit rows: display names, not raw ids.
- **Cases at desktop stage width (regression):**
  - Wave index still fully visible.
  - Hangar actions and full roster still complete.
  - Upgrade bay four-up (or current desktop arrangement) still complete.
  - Title keyboard-oriented help still accurate.
  - High Scores display names still correct.
- **Prior art:** gameplay-hud and UI-primitive-library PRDs already treat the rendered browser surface plus `__THREE_GAME_TEST_HOOKS__` / `__tcfuAcceptance` as the high seam. Match that pattern. Existing sim unit tests remain the authority for scoring and Scrap math and should not be duplicated here.
- **Manual screenshot recapture** of Hangar, Upgrade bay, and Run mobile stills is useful design evidence after the fix but is not the automated gate.

## Out of Scope

- Visual identity redesign, new tokens, new primitives, or brand lockup work (already audit-green).
- Touch-control chrome capture recipes, forcing coarse-pointer emulation in design docs, or a full mobile input redesign beyond Title help copy.
- Pause modal, Destroyed overlay, boss bar, powerup rail, or other Run overlay still completeness in the design screenshot set.
- Committing, indexing, or renaming the `docs/design/screenshots` folder (including `debrief` vs `results` naming hygiene).
- Changes to Scrap formulas, meta rank costs/effects, ship unlock scores, combat balance, weapons, powerups, wave playlists, or set-piece scheduling.
- Localization, full accessibility audit, input rebinding, or new settings fields.
- Pixel-perfect visual regression infrastructure or WebGL frame assertions.
- Claiming certified support for every device, safe-area hardware notch, or orientation; the contract is the stage container at the representative widths above.

## Further Notes

- Domain language: **Run**, **Hangar**, **Upgrade bay**, **Scrap**, **meta upgrade**, **meta rank**, **ship kit**, **career best**, **wave**, **movement band**, **Debrief** (Results screen title). Prefer these over “shop,” “level,” “class,” or “high score” when meaning career best vs the local board.
- The screenshot audit’s brand checklist (void field, cyan player vs amber threat, salvage gold Scrap, notched primitives) is **not** reopened; do not spend scope there unless a layout change accidentally regresses it.
- Hangar and Upgrade bay problems are both product layout and capture methodology: top-of-scroll PNGs look broken because first paint is broken. Fix layout first; recapture later if desired.
- Mobile Run HUD hiding kills, graze, and Scrap estimate is **intentional condensation** today. Keep it unless a story above explicitly requires bringing a secondary stat back without crowding survival or wave progress.
- Success: a player on a phone-class stage can read the wave index mid-Run, launch from Hangar without hunting, see all meta branches in Upgrade bay, get honest Title control help, and read ship names on High Scores—while desktop stays intact and the single browser acceptance seam stays green.
