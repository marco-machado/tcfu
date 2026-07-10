# Tickets

Implementation and design work is tracked under [`.scratch/`](.scratch/). This file is the **frontier index**: open work first, then a resolved log. Prefer the issue tracker conventions in [`docs/agents/issue-tracker.md`](docs/agents/issue-tracker.md).

## Frontier

No open implementation PRDs. All feature packages under `.scratch/` are `resolved`.

Optional product directions (not ticketed yet):

| Direction | Notes |
|-----------|--------|
| Playtest + difficulty/content retune | Human runs past mid/late waves; pattern density, Colossus, drops |
| Production art (Tripo → GLB) | [`docs/design/research/art-pipeline.md`](docs/design/research/art-pipeline.md); view registry swap |
| Audio beyond stubs | Music direction open in design; real SFX matrix |
| QA / release packaging | Visual harness, bot playtest, deploy notes |

When starting one of these, add `.scratch/<feature>/PRD.md` (and issues) and list it here.

## Resolved packages

| Package | PRD | Notes |
|---------|-----|--------|
| Spaceshooter design (wayfinder) | [`.scratch/spaceshooter-design/map.md`](.scratch/spaceshooter-design/map.md) | Decisions → [`docs/design/DESIGN.md`](docs/design/DESIGN.md) |
| First playable loop | [`.scratch/first-playable-loop/PRD.md`](.scratch/first-playable-loop/PRD.md) | Combat, death, waves, Results |
| Powerups and W-cells | [`.scratch/powerups-w-cells/PRD.md`](.scratch/powerups-w-cells/PRD.md) | Run upgrades + six powerups |
| Meta Upgrade bay | [`.scratch/meta-upgrade-bay/PRD.md`](.scratch/meta-upgrade-bay/PRD.md) | Scrap ranks |
| Ship-kit identity | [`.scratch/ship-kit-identity/PRD.md`](.scratch/ship-kit-identity/PRD.md) | Four kits + unlocks |
| Content depth | [`.scratch/content-depth/PRD.md`](.scratch/content-depth/PRD.md) | 24 patterns, elites, set-pieces, boss bar |
| Presentation v1 | [`.scratch/presentation/PRD.md`](.scratch/presentation/PRD.md) | Events, juice stubs, rumble, sway |
| Procedural premium interim | [`.scratch/procedural-premium-interim/PRD.md`](.scratch/procedural-premium-interim/PRD.md) | ADR 0005 interim art |

### Post-package sim work (no dedicated PRD)

- **No-damage wave bonus** — `floor(150 × (1 + 0.1 × (waveIndex − 1)))` when no HP lost that wave; see scoring in [`docs/design/DESIGN.md`](docs/design/DESIGN.md).
