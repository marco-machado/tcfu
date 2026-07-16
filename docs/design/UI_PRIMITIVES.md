# TCFU UI primitives

The DOM UI primitive library. One canonical component per reusable atom, living in
`src/app/components/ui/`. Screens and HUD compose these; they never hand-write design
class strings. This catalog is the reference for what exists and its variant API.

Rationale and the rejected alternatives are in
[`docs/adr/0007-ui-primitive-library.md`](../adr/0007-ui-primitive-library.md).
Visual language (color, type, shape, motion) is governed by
[`VISUAL_IDENTITY.md`](./VISUAL_IDENTITY.md); this document maps each primitive to those
motifs. It does not restate them.

## Conventions

- **Location:** `src/app/components/ui/`, one file per primitive, barrel-exported.
- **Variants are props.** A small internal `cn()` helper maps props to modifier classes
  (`btn` plus `btn--primary`). No `class-variance-authority`, no Tailwind.
- **State stays on `is-*` classes** (`is-active`, `is-on`, `is-expiring`), matching the
  existing CSS. Prefer state props that render `is-*` over ad-hoc booleans in screens.
- **Styling is central**, in `src/app/styles/`, split by `@layer tokens, base, primitives,
  screens`. Primitive classes live in `primitives.css`; screen layout in `screens.css`.
- **No raw hexes in the primitive layer.** Use tokens (see below).

## Tokens

Hues are defined in `VISUAL_IDENTITY.md` (`--void-*`, `--hull-700`, `--signal-*`,
`--threat-*`, `--salvage-gold`, `--repair-lime`, `--ice-white`, `--muted-steel`). The
primitive layer adds functional tokens so recurring greys and borders have one source:

- **Surfaces:** `--surface-panel`, `--surface-raised`
- **Borders:** `--border-hull`, `--border-hairline`
- **Text tiers:** `--text-secondary`, `--text-faint` (primary text is `--ice-white`)
- **Notch scale:** `--notch-sm: 6px`, `--notch: 8px`, `--notch-lg: 10px`

The notch is the insignia-derived clipped corner (`VISUAL_IDENTITY.md` > Shape and
layout). It is a token scale, not a per-element literal; the old 5/7/9px offsets are drift
and do not return.

## Primitives

Each entry lists the props that matter and the ad-hoc classes it supersedes. Final prop
names are firmed up in code; treat these as the intended API.

### Button

Primary action affordance. Motif: clipped corners, uppercase micro-label type.

- `variant`: `primary` | `secondary` | `tertiary` | `danger` | `ghost`
- optional leading `icon` (an `Icon` name)
- Replaces: base `button`, `.primary-action`, `.tertiary-action`, `.danger-btn`, and the
  parallel `.modal-btn` / `.modal-btn-primary` / `.modal-btn-secondary` /
  `.modal-btn-danger` / `.modal-btn-ghost` system.

### IconButton

Square, notched, icon-only control. Motif: clipped corners, silhouette-first icon.

- `icon`: an `Icon` name; `label` for accessibility
- Replaces: `.hud-icon-btn` (and the bespoke `.pause-glyph`).

### Panel

The notched surface substrate for modals, cards, HUD clusters, and chips.

- `size`: `sm` | `md` | `lg` (notch scale; default `md` = 8px)
- `tone`: `default` | `danger` (and other signal tones as needed)
- `as`: element override
- Replaces the hand-repeated notch `clip-path` + border + gradient on `.hud-module`,
  `.modal`, `.bay-card`, `.ship-card`, `.kit-preview`, `.results-body`, `.settings-panel`,
  `.resource-chip`, `.powerup-badge`.

### Heading

Display type. Motif: compressed heavy forward-leaning uppercase (`VISUAL_IDENTITY.md` >
Typography).

- `level` / `size` for scale
- Replaces the repeated Impact/Haettenschweiler italic-uppercase rule on `.title-wordmark`,
  `.screen-header h2`, `.run-banner strong`, `.modal h2`, `.boss-name`,
  `.kit-preview-heading strong`, `.bay-rank`.

### Label

Uppercase tracked micro-label. Motif: micro-labels with generous tracking.

- `variant`: `default` | `kicker`
- `tone`: default text tiers
- Replaces `.hud-label`, `.screen-kicker`, and the recurring `small` uppercase labels in
  `.resource-chip`, `.bay-card-head`, `.kit-metrics`, `.preview-rail`, `.setting-label small`.

### Meter

Track + fill progress bar. Motif: instrument telemetry.

- `value`: 0..1
- `tone`: `signal` | `salvage` | `threat` | `repair`
- `segments`: optional tick count (for the boss bar)
- Replaces `.combo-track`/`.combo-fill`, `.wave-track`/`.wave-fill`,
  `.wcell-track`/`.wcell-fill`, `.boss-track`/`.boss-fill`, `.kit-metrics i`/`em`.

### PipRow

A row of discrete state pips. Motif: ticks and segments derived from the insignia.

- `count`, `filled`
- `shape`: `diamond` | `chevron` | `segment` | `dot`
- `tone`
- Replaces `.tier-pips`, `.life-pips`/`.life-pip`, `.bomb-pips`/`.bomb-pip`,
  `.rank-rail`, `.hull-segments`/`.hull-seg`.

### Chip

Compact labeled token (icon + label + value). Motif: clipped corners, micro-label.

- `tone`: `default` | `scrap` | `expiring`
- optional `icon`
- Replaces `.resource-chip`, `.results-stats span`, and the `.powerup-badge` base.

### Toggle, Slider, Segmented

Form controls. Lifted out of `SettingsScreen` (where `Toggle` and `Slider` are currently
inline) into shared components.

- `Toggle`: `checked`, `onChange`, `label`, `hint` (renders `role="switch"`, `is-on` state)
- `Slider`: `value`, `onChange`, `min`/`max`, `label`
- `Segmented`: `options`, `value`, `onChange` (renders `role="radiogroup"`, `is-active` state)
- Replaces `.toggle*`, `.slider-wrap` + `.slider-value`, `.segmented`.

### Modal, Overlay

Dialog shell and its backdrop. Motif: notched panel, one sharp acquisition pulse.

- `Overlay`: `tone` (`default` | `pause` | `death`)
- `Modal`: composes `Overlay` + `Panel`; `title`, `sub`, actions slot
- Replaces `.overlay`, `.pause-overlay`, `.death-overlay`, `.modal`, `.modal-actions`,
  `.modal-sub`, `.modal-hint`, `.death-modal`.

### ScreenHeader

The header block reused on every screen: display heading + kicker + gradient rule.

- `title`, `kicker`
- Replaces `.screen-header` + `.screen-header h2` + `.screen-kicker` + `.screen-header::after`.

### Icon

The authored `SignalIcon` family (renamed `Icon` on move). See `SignalIcon` source for the
name set. Motif: survives at 16px, silhouette before glow.

### BrandMark

The insignia mark. Motif: signature lockup (`VISUAL_IDENTITY.md` > Signature motif).

## Not primitives

These are single-use screen compositions. They are rebuilt on the primitives above but
stay in their screens, not in `ui/`:

- HUD clusters: `score-cluster`, `survival-cluster`, `weapons-cluster`, `wave-cluster`,
  `boss-bar`, `powerup-row`
- Cards: `bay-card`, `ship-card`, `kit-preview`
- Screen scaffold classes in `screens.css`: `screen--narrow` / `screen--wide` (centered
  scrolling content column with a width cap and a sticky `screen-header`) and
  `screen-actions` (sticky right-aligned bottom action row)
