# TCFU (They Came From Uranus) UI conventions

Dark sci-fi console UI for a space shooter. Everything is designed for a near-black void background: always build on `background: #03070b` (the `:root` background in `styles.css`) or inside a `Panel`. Text on white will be invisible: primary text is `--ice-white`.

## Setup

No provider is required. Import components from `window.TCFU` and make sure the page shows the dark void background from `styles.css` (`:root` carries `color-scheme: dark`, the Inter font stack, and the background). Fonts are system stacks: body text is Inter with system fallbacks; display headings use Impact / Haettenschweiler / 'Arial Narrow Bold'. No webfonts ship or load.

## Styling idiom

Class-based CSS with cascade layers (`@layer tokens, base, primitives, screens`). Variants are props on the components, which map to modifier classes internally (`btn btn--primary`); state uses `is-*` classes (`is-on`, `is-active`). Do NOT hand-write design class strings for things a component prop covers; use the props. For your own layout glue, use inline styles or plain flex/grid CSS plus the tokens below. There is no Tailwind and no utility-class vocabulary.

Tokens (defined in `styles.css` under `@layer tokens`, use as `var(--*)`):

- Hues: `--void-950`, `--void-900`, `--hull-700`, `--signal-cyan`, `--signal-blue`, `--threat-magenta`, `--threat-amber`, `--salvage-gold`, `--repair-lime`, `--ice-white`, `--muted-steel`
- Surfaces and borders: `--surface-panel`, `--surface-raised`, `--border-hull`, `--border-hairline`
- Text tiers: `--text-secondary`, `--text-faint` (primary text is `--ice-white`)
- Notch scale: `--notch-sm` (6px), `--notch` (8px), `--notch-lg` (10px) — the clipped-corner motif

No raw hexes for UI chrome; use the tokens.

## Components (window.TCFU)

`Button` (variant: primary/secondary/tertiary/danger/ghost, optional leading `icon`), `IconButton` (icon + `label` for a11y), `Panel` (notched surface; size sm/md/lg, tone default/danger, `as` element override — the substrate for cards, modals, HUD clusters; it ships no padding, add your own), `Heading` (size sm/md/lg/xl — compressed uppercase display type), `Label` (variant default/kicker — uppercase tracked micro-label), `Meter` (value 0..1, tone signal/salvage/threat/repair, `segments`), `PipRow` (count/filled, shape diamond/chevron/segment/dot, or `icon` pips where `tone` signal/salvage colors the icons), `Chip` (tone default/scrap/expiring, optional icon), `Toggle`/`Slider`/`Segmented` (controlled form controls: pass value + onChange; they render the settings-row layout themselves), `Overlay` (tone default/pause/death; `position:absolute inset:0` — needs a positioned ancestor), `Modal` (composes Overlay + Panel; title, sub, children; put actions in a `<div className="modal-actions">`), `ScreenHeader` (title + kicker + gradient rule), `ScreenRails` (decorative edge rails, `code` string), `Icon` (26 names, e.g. launch, shield, bomb, scrap, back, pause — see Icon.d.ts), `BrandMark` (telemetry insignia glyph).

Read each component's `.d.ts` for the exact props and `styles.css` for the token values before styling.

## Idiomatic example

```jsx
const { Panel, Label, Heading, Meter, Button } = window.TCFU

<div style={{ background: '#03070b', minHeight: '100vh', padding: 24 }}>
  <Panel size="lg" style={{ padding: 20, maxWidth: 340, display: 'grid', gap: 10 }}>
    <Label variant="kicker">Bay 03 // Vanguard</Label>
    <Heading size="md">Hull integrity</Heading>
    <Meter value={0.72} tone="repair" />
    <Button variant="primary" icon="launch">Launch sortie</Button>
  </Panel>
</div>
```
