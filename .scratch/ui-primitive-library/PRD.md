# UI primitive library and central style layers

Status: `resolved`

## Problem Statement

The DOM UI is built from one 1734-line global `styles.css` of hand-authored class names, wired into screens by hand. The same visual motifs are re-authored every time they appear, and only two shared components exist (`SignalIcon`, `BrandMark`); `Toggle` and `Slider` are duplicated inline inside `SettingsScreen`. As a result the interface has drifted away from its own visual identity:

- The insignia-derived clipped corner is canonically 8px in `VISUAL_IDENTITY.md`, but the CSS cuts it at 5, 6, 7, 8, 9, and 10px across roughly fifteen surfaces.
- The `:root` palette is defined, yet dozens of hardcoded hexes bypass or duplicate it (`#eaf8ff` is `--ice-white`; recurring greys like `#86a8ba`, `#6f899a` and border rgbas like `rgba(86,160,199,0.3)` have no single source).
- One motif is implemented many times over: the notched panel surface (nine-plus places), the Display heading (seven), the micro-label (seven), the meter track+fill (five near-duplicates), the pip row (five variants), the chip (three), and two parallel button systems (`.primary-action` family versus `.modal-btn` family).

Building a new screen means copying class strings and guessing at values, so every addition risks widening the drift. There is no single place that says what a button, panel, or meter is.

## Solution

Consolidate the DOM UI into a shadcn-style primitive library. Every reusable UI atom becomes one canonical React component under `src/app/components/ui/`, with variants expressed as props. Screens and the HUD compose these components and never hand-write design class strings again. The finite variant set defined in one place, one notch token scale, and one token per functional color role make drift structural to prevent rather than a recurring cleanup.

As part of the same effort, the thin `src/shell/` layer merges into `src/app/` so there is a single conventional front-end home, while the engine layers (`sim`, `view`, `presentation`, and support) stay as untouched siblings. Styling stays central but splits into ordered `@layer` files that separate the reusable primitive layer from screen-specific layout.

The end state is that there is exactly one way to build a button, a panel, a meter, or a chip, and the interface matches `VISUAL_IDENTITY.md` by construction.

## User Stories

1. As a screen author, I want to import a `Button` component instead of remembering class names, so that every action affordance looks and behaves consistently.
2. As a screen author, I want button intent expressed as a `variant` prop (`primary`, `secondary`, `tertiary`, `danger`, `ghost`), so that I cannot accidentally invent a new button style.
3. As a screen author, I want the two former button systems (the `.primary-action` family and the `.modal-btn` family) unified into one `Button`, so that modal and screen buttons stop diverging.
4. As a screen author, I want a `Panel` component for the notched surface, so that modals, cards, HUD clusters, and chips share one clipped-corner treatment.
5. As a designer, I want the clipped corner to come from a three-step notch token scale (`--notch-sm` 6px, `--notch` 8px default, `--notch-lg` 10px), so that the arbitrary 5/7/9px offsets disappear while the intentional small-chip versus hero-panel proportion survives.
6. As a designer, I want Display headings rendered by one `Heading` component, so that the compressed uppercase lockup is identical on the title, screen headers, banners, modals, and the boss name.
7. As a designer, I want uppercase micro-labels rendered by one `Label` component with a `kicker` variant, so that every tracked small-caps label shares one type treatment.
8. As a player, I want every progress bar (combo, wave, W-cell, boss, kit metrics) rendered by one `Meter`, so that telemetry reads consistently across the HUD and hangar.
9. As a player, I want the boss bar's segment ticks supported by the same `Meter` via a `segments` prop, so that the set-piece readout is the meter primitive, not a bespoke bar.
10. As a player, I want discrete state indicators (weapon tier, lives, bombs, meta rank, hull segments) rendered by one `PipRow` with a `shape` variant, so that pip families stay visually coherent.
11. As a player, I want compact tokens (resource chips, results stats, powerup badges) rendered by one `Chip`, so that labeled value tokens share a shape and rhythm.
12. As a player adjusting settings, I want the `Toggle`, `Slider`, and `Segmented` controls to be shared components, so that they behave identically wherever they appear and are no longer defined inline in one screen.
13. As a player using a switch or radio control, I want the shared controls to keep their `role="switch"` and `role="radiogroup"` semantics and `is-*` state, so that keyboard and assistive-technology behavior is preserved.
14. As a player, I want pause, death, and confirmation dialogs rendered by one `Modal` over one `Overlay`, so that dialog framing and backdrop tone are consistent.
15. As a player, I want every screen's header (Display heading + kicker + rule) rendered by one `ScreenHeader`, so that screens open with the same masthead.
16. As a screen author, I want `Icon` (the renamed `SignalIcon` family) and `BrandMark` living in the primitive library, so that all shared UI atoms have one home.
17. As a maintainer, I want the HUD clusters (score, survival, weapons, wave, boss) and cards (bay card, ship card, kit preview) rebuilt on primitives but left in their screens, so that single-use compositions are not falsely promoted into the library.
18. As a maintainer, I want recurring greys, borders, and text tiers expressed as functional tokens (surfaces, borders, text) on top of the existing hue palette, so that a panel border or a muted label has exactly one source.
19. As a maintainer, I want hardcoded hexes in the primitive layer replaced with tokens, so that the palette in `VISUAL_IDENTITY.md` is actually the source of truth.
20. As a maintainer, I want variants mapped to modifier classes by a small internal `cn()` helper with `is-*` state, so that the CSS stays class-based, greppable, and free of a new dependency.
21. As a maintainer, I want the styling split into `@layer tokens, base, primitives, screens`, so that the reusable primitive layer is visibly separate from screen layout and drift is easy to spot.
22. As a maintainer, I want `src/shell/` merged into `src/app/` (`app/screens/`, `app/hud/`, `app/components/ui/`, `app/components/`, `app/styles/`), so that there is one conventional front-end home and the disliked `shell` name is gone.
23. As a maintainer, I want `sim`, `view`, `presentation`, `audio`, `input`, and `persist` left as untouched top-level siblings, so that the render-only engine boundary from ADR 0006 is preserved.
24. As a maintainer, I want the migration to end with every screen consuming `ui/` and the superseded ad-hoc classes deleted, so that no two parallel styling systems coexist.
25. As a maintainer, I want the migration done incrementally with the app compiling and `vitest` green throughout, so that the interface is never broken mid-refactor.
26. As a future contributor, I want the primitive catalog documented in `UI_PRIMITIVES.md` and the decision recorded in ADR 0007, so that I can find what exists and why Tailwind, `cva`, and CSS modules were rejected.
27. As a player, I want the migration to be visually identical except where the notch and token normalization intentionally changes pixels, so that the refactor does not regress the look I already have.
28. As a player on a narrow or 4:3 layout, I want the existing container-query responsive behavior preserved through the primitives, so that no layout breaks at supported widths.
29. As a player with reduced motion enabled, I want the primitives to keep honoring `prefers-reduced-motion`, so that animation state still degrades to color and shape.

## Implementation Decisions

- **Primitive library.** Build one canonical component per reusable atom in `src/app/components/ui/`, barrel-exported: `Button`, `IconButton`, `Panel`, `Heading`, `Label`, `Meter`, `PipRow`, `Chip`, `Toggle`, `Slider`, `Segmented`, `Modal`, `Overlay`, `ScreenHeader`, plus `Icon` (renamed `SignalIcon`) and `BrandMark` moved in. Variant/prop APIs are catalogued in `docs/design/UI_PRIMITIVES.md`; treat that as the intended interface and reconcile it to the real signatures as they are implemented.
- **Variants as props.** A small internal `cn()` helper maps props to modifier classes (`btn` plus `btn--primary`). Component state stays on `is-*` classes (`is-active`, `is-on`, `is-expiring`), matching current CSS. No `class-variance-authority`, no Tailwind, no data-attribute styling.
- **Composition boundary.** `ui/` holds generic primitives plus the genuinely cross-screen shells (`Modal`, `Overlay`, `ScreenHeader`). HUD clusters (`score`, `survival`, `weapons`, `wave`, `boss`, `powerup-row`) and cards (`bay-card`, `ship-card`, `kit-preview`) are rebuilt on primitives but remain in their screens.
- **Directory restructure.** Merge `src/shell/` into `src/app/`: `app/screens/`, `app/hud/`, `app/components/ui/`, `app/components/` (non-primitive shared chrome: `Stage`, `MenuBackdrop`, `DebugPanel`), `app/styles/`. Update all import paths and the `src-directory-guide.html` reference. Do this as step 0. Leave `sim`, `view`, `presentation`, `audio`, `input`, `persist` untouched.
- **Central style layers.** Replace the single `styles.css` with `src/app/styles/{tokens,base,primitives,screens}.css`, ordered `@layer tokens, base, primitives, screens`. Primitive classes live in `primitives.css`; screen layout in `screens.css`. No CSS modules, no inline styles.
- **Notch tokens.** Introduce `--notch-sm: 6px`, `--notch: 8px`, `--notch-lg: 10px`. `Panel` exposes `size` (`sm`|`md`|`lg`, default `md`). Remove the 5/7/9px one-offs.
- **Functional tokens.** Add roughly six to eight tokens on top of the existing hues: surfaces (`--surface-panel`, `--surface-raised`), borders (`--border-hull`, `--border-hairline`), and text tiers (`--text-secondary`, `--text-faint`). Replace hardcoded hexes in the primitive layer with tokens. Semantic signal hues (cyan, amber, magenta, gold, lime) are unchanged.
- **Migration is the definition of done.** Every screen and the HUD migrate onto the primitives, and the superseded ad-hoc classes are deleted, so exactly one way to build each element remains. Execute incrementally, primitive by primitive, keeping the app compiling and `vitest` green at each step.
- **Glossary boundary.** `CONTEXT.md` is left untouched; primitive names are implementation vocabulary and belong in the design docs, not the domain glossary.

## Testing Decisions

- **What makes a good test here:** it asserts observable outcomes (a screen still renders its state, a control still toggles, the engine still behaves), not the internal mapping from a prop to a class name. The variant-to-class mapping and the `cn()` helper are implementation detail and are not worth direct tests.
- **Guardrail seam (existing, automated):** the full `vitest` suite stays green throughout the migration. Because the work is confined to the DOM UI, `sim`, `view`, `presentation`, and `persist` logic must be unaffected, so a green suite is the automated proof that the refactor did not reach into the engine. This is the primary automated gate at each incremental step.
- **Appearance and behavior seam (existing, high):** verify the rendered UI through the two dev seams already in the codebase. `__THREE_GAME_TEST_HOOKS__.setState` reaches the Run and HUD states (`title`, `hangar`, `active-play`, `stress`, `boss`, `fail`); `__tcfuAcceptance.sessionStore` reaches every menu screen via `setScreen` (`hangar`, `upgradeBay`, `results`, `highScores`, `settings`). Drive these and compare before/after screenshots. The migration should be pixel-identical except where the notch scale and token normalization intentionally change output; those deltas are expected and reviewed, not regressions.
- **Modules exercised:** every screen (`TitleScreen`, `HangarScreen`, `UpgradeBayScreen`, `RunScreen`, `ResultsScreen`, `HighScoresScreen`, `SettingsScreen`), the in-run HUD (`RunHud`, `PauseModal`, `TouchControls`), and the interactive controls (`Toggle`, `Slider`, `Segmented`, `Modal`) through their rendered states.
- **Prior art:** the named-state harness in `src/app/testHooks.ts` and the acceptance seam in `src/app/acceptanceSeam.ts` are the established pattern for browser-level checks that avoid coupling to React or CSS internals. Reuse them; do not introduce a new seam.
- **No new test framework.** Do not add `@testing-library/react` or a committed Playwright suite for this refactor. The behavior is preserved, so the existing guardrail plus the existing visual harness are sufficient and keep the seam count minimal.

## Out of Scope

- No visual redesign. This is consistency and extraction, not a new look. Intentional changes are limited to the notch normalization and the token cleanup.
- No new UI features, screens, or controls.
- No Tailwind, `class-variance-authority`, CSS modules, or data-attribute styling.
- No changes to `sim`, `view`, `presentation`, `audio`, `input`, or `persist`.
- No mobile or touch gameplay changes beyond preserving the existing `TouchControls` behavior.
- No new automated test framework or committed visual-regression suite.
- `CONTEXT.md` is not modified.

## Further Notes

- Rationale and rejected alternatives are recorded in `docs/adr/0007-ui-primitive-library.md`; the primitive and variant catalog is `docs/design/UI_PRIMITIVES.md`, cross-linked from `VISUAL_IDENTITY.md` and `AGENTS.md`.
- The prop APIs in `UI_PRIMITIVES.md` are the intended design, not verified against a build. Reconcile the catalog to the real signatures during implementation.
- Suggested sequencing: (0) merge `shell` into `app` and update imports; (1) stand up `tokens`/`base` styles and the token additions; (2) build primitives and their `primitives.css` classes; (3) migrate screens and HUD one at a time onto primitives; (4) delete superseded classes and confirm none remain. Keep the app compiling and `vitest` green at every step.
