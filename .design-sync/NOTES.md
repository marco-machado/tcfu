# design-sync notes

- This repo is a Vite app, not a library: no dist and no shipped .d.ts. The bundle builds straight from the TS barrel with `--entry ./src/app/components/ui/index.ts`, and the 17 components are pinned explicitly in `cfg.componentSrcMap` (auto-discovery finds zero without it).
- `cfg.cssEntry` points at `.design-sync/.cache/flat.css`, produced by `cfg.buildCmd` (esbuild flattens `src/app/styles/index.css`, whose relative `@import`s would otherwise dangle in the bundle). Run buildCmd before any converter run on a fresh clone.
- The DS is dark-theme-only: `:root` in tokens.css carries the void background. Preview cells are white, so `cfg.provider` wraps every cell in `PreviewBackdrop` (`.design-sync/preview-backdrop.tsx`, wired via `cfg.extraEntries`). Without it, ice-white text is invisible.
- PipRow `tone` only affects icon pips (`.pip-row--signal/.pip-row--salvage` target `.icon.pip`); shape pips do not vary by tone. Don't author a shape-x-tone sweep.
- Overlay and ScreenRails are `position:absolute inset:0`; previews wrap them in fixed-size `position:relative` frames. ScreenRails needs a frame at least ~420px tall or the vertical rail text wraps into overlapping columns.
- Fonts: CSS references Inter and Impact/Haettenschweiler stacks; the repo ships no font files. User accepted system-fallback substitutes for Inter (2026-07-17). Expect `[FONT_MISSING]` on every validate — known warn.
- Known render warns: none besides `[FONT_MISSING]` above.
- Hover/press/focus states and drag interaction on Slider are not statically renderable; previews skip them.

## Re-sync risks

- `flat.css` is generated into the gitignored `.cache/`; a re-sync that skips `cfg.buildCmd` builds against a stale or missing stylesheet.
- Component list is a hand-pinned `componentSrcMap`; a new primitive added to `src/app/components/ui/index.ts` will NOT appear until it's added to the map.
- Token names in `conventions.md` were validated against tokens.css on 2026-07-17; renames there (e.g. threat hues) silently rot the header.
- Build assumed node 24 / npm ci with the repo lockfile; playwright 1.61.0 matches the machine's cached chromium-1228.
