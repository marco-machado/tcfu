# Ship-kit identity

Status: `resolved`

## Problem Statement

Players can already select four ship kits and fire four different weapon lines, but kit identity is incomplete. Hurtboxes ignore catalog radii, Aegis only starts shielded on the first life, unlocks depend on the top-10 high-score list instead of career best, Hangar cards barely explain each kit, Results shows raw ids, and every ship still looks like the same cyan placeholder. Non-Vanguard kits do not fully feel like distinct fantasies in hull, progression honesty, or presentation.

## Solution

Make each **ship kit** a complete identity: one catalog-backed kit table drives stats and passives; hitboxes, HP, bombs, move mult, and passives apply correctly (including Aegis shield on every life); **career best** single-Run score unlocks kits; Hangar and Results communicate kit identity; placeholder meshes differ by kit. Weapon tier tables stay as they are—they already match the weapons catalog.

## User Stories

1. As a player, I want each ship kit’s hitbox to match the catalog radius, so that Striker is slipperier and Aegis is chunkier in combat.
2. As a Striker pilot, I want 2 HP per life and 1.15 move mult, so that glass offense feels real beyond weapon DPS.
3. As an Aegis pilot, I want 3 starting bombs and 0.9 move mult, so that the armored wing fantasy holds in mobility and stock.
4. As a Phantom pilot, I want a smaller hitbox and 1.25 move mult, so that the ghost interceptor fantasy holds in the band.
5. As an Aegis pilot, I want a shield buffer at the start of every life (Run start and each respawn), so that start_shield matches the catalog.
6. As a player with Hull meta rank 2 on a non-Aegis kit, I want a shield only on life 1 of the Run, so that meta and Aegis passives stay distinct but still one buffer max.
7. As a Phantom pilot, I want hit i-frames of 1.25 s base (plus Hull meta), so that the passive is felt after HP damage.
8. As a Phantom pilot, I want respawn i-frames to stay 2.0 s, so that only hit recovery is special-cased.
9. As a Striker pilot, I want weapon damage +10% after tier values (then Arsenal meta), so that dmg_10 stacks as designed.
10. As a player, I want all four weapon lines and tiers to keep working as today, so that this slice does not regress fire patterns.
11. As a player, I want lives to stay 3 and max bombs 5 before Hull meta for every kit, so that meta and global combat rules stay shared.
12. As a player, I want unlock thresholds 0 / 25_000 / 75_000 / 150_000 for Vanguard / Striker / Aegis / Phantom, so that score milestones match the catalog.
13. As a player, I want unlocks to use my career best single-Run score, so that a strong Run unlocks kits even if it falls out of the top-10 list.
14. As a player, I want career best to update at Results when I beat it, so that progression is automatic.
15. As a player, I want Hangar to unlock a kit only when career best meets its threshold, so that selection stays honest.
16. As a player, I want Vanguard always available, so that I can always Launch.
17. As a player, I want Results to name newly unlocked kits when this Run crosses a threshold, so that unlocks are celebrated.
18. As a player, I want Results to show the ship kit display name, so that ids are not raw chrome.
19. As a player, I want Hangar unlocked cards to show HP, hitbox, move, start bombs, passive one-liner, and weapon line name, so that I can choose intentionally.
20. As a player, I want Hangar locked cards to show blurb and unlock score only, so that locked kits stay lightly mysterious.
21. As a player, I want my last selected ship remembered across sessions when still unlocked, so that retry is smooth.
22. As a player, I want selection to fall back to Vanguard if the last ship is invalid after reset or data issues, so that Launch never soft-locks.
23. As a player, I want each kit’s placeholder mesh to look different (silhouette/color), so that I can read identity in the Run without production art.
24. As a player, I want the mesh never to be the collision authority, so that catalog hitboxes stay fair.
25. As a player, I want the Run HUD to stay free of kit chrome clutter, so that combat readability stays primary.
26. As a developer, I want one kit table as the source of truth, so that shell and sim do not diverge on stats or copy.
27. As a developer, I want pure unlock and career-best helpers, so that progression rules are testable without React.
28. As a developer, I want createWorld/respawn to apply kit + meta without scattered ship switches, so that future kits stay cheap.

## Implementation Decisions

### Scope

- Complete catalog-faithful ship kit identity: stats, passives, career-best unlocks, Hangar/Results identity UX, placeholder visuals.
- Do not rebalance weapon numbers or add ships; weapon tier tables remain as currently implemented and tested.
- Respect ADR `0003-ship-unlocks-use-career-best` and existing meta modifier snapshot ADR for combat meta.

### Ship kit table (source of truth)

- Pure table keyed by ship kit id with at least: display name, blurb, unlock score, move mult, hitbox radius, max HP per life, start bombs, max bombs (base 5), weapon id / line name, passive id and effect descriptors for UI.
- Binding values:

| Kit | unlock | move_mult | hitbox_r | hp | start_bombs | weapon | passive |
|-----|--------|-----------|----------|-----|-------------|--------|---------|
| Vanguard | 0 | 1.0 | 0.35 | 3 | 2 | pulse_cannon | none |
| Striker | 25000 | 1.15 | 0.32 | 2 | 2 | twin_lance | dmg_10 |
| Aegis | 75000 | 0.9 | 0.38 | 3 | 3 | wide_pulse | start_shield each life |
| Phantom | 150000 | 1.25 | 0.28 | 3 | 2 | needle | iframe_bonus (hit 1.25 s) |

- Lives remain 3 for all kits. Max bombs base 5 before Hull meta.

### Sim application

- `createWorld` / Run reset: set maxHp, hp, hitboxR, start bombs, max bombs (with meta bonuses), move mult via existing speed formula, shield from Aegis passive and/or Hull r2 start-run shield, shipId.
- **Aegis start_shield:** grant shield on Run start and on every respawn when lives remain. Still one buffer; clears on absorb and before respawn re-grant.
- **Hull meta rank 2:** still “shield on life 1 only” for kits without Aegis; with Aegis, shield remains boolean one-buffer (no stack).
- Phantom hit i-frames: base 1.25 s + Hull hit bonus; respawn/shield/bomb i-frames unchanged.
- Striker dmg_10: keep after tier weapon damage, before/with Arsenal mult as already designed.
- Movement: `base max speed × kit move_mult × thrusters mult`; shared accel/decel.
- Hitbox radius from kit used for player vs enemy body/bullet and powerup collection; no mesh authority.
- Replace scattered ship-id switches with kit table lookups where practical.

### Career best and unlocks

- Persist career best single-Run score locally (dedicated field/key next to existing persist).
- At Results: if run score > career best, update and save.
- Unlock: kit available iff career best ≥ unlock score (Vanguard always).
- Pure helpers: e.g. unlock predicate and list of kits newly unlocked by a score given previous career best.
- High-score top-10 remains independent; must not be unlock source of truth.
- Last selected ship: if locked or unknown, force Vanguard and persist.

### Shell UX

- Hangar unlocked card: name, blurb, HP, hitbox, move mult, start bombs, passive one-liner, weapon line name; selected state; Launch only when selected kit unlocked.
- Hangar locked card: name, blurb, unlock threshold; not selectable.
- Results: display kit name; show career best if useful; announce newly unlocked kit names when this Run crosses thresholds.
- Run HUD: no new kit identity chrome.

### Presentation

- Placeholder player mesh/material per kit (scale and color/emissive):
  - Vanguard: cyan baseline
  - Striker: longer/narrower, warmer accent
  - Aegis: wider/heavier, cooler armor tone
  - Phantom: slim/darker, thin silhouette
- Optional slight visual hull scale by kit for readability; collision remains catalog hitbox.
- No production GLB requirement.

### Modules to deepen

- Ship kit catalog module (pure).
- World create / respawn paths.
- Career best persist + Results/session wiring.
- Hangar and Results screens.
- Player view mesh by shipId.
- Tests for kit create, Aegis respawn shield, unlock/career best.

## Testing Decisions

### What makes a good test

- Assert external behavior: world fields after create/respawn, collision radius effects where practical, shield after Aegis life loss, unlock boolean and newly unlocked list from scores, career best update rule.
- Do not assert React trees, CSS, mesh graphs, or private helper names.
- Prefer pure kit/unlock helpers and `createWorld` / `stepWorld` seams.

### Seams

1. **Kit resolve + world create/respawn (primary combat identity):** hitbox, HP, bombs, start shield each Aegis life, move mult observable via speed if already tested pattern, weapon passive retained.
2. **Career best / unlock pure functions:** thresholds, Vanguard always open, newly unlocked detection, independence from high-score list.
3. Shell layout and mesh look: manual smoke only.

### Coverage expectations

- Each kit’s createWorld stats match the table.
- Aegis: shield true at start; after life loss + respawn, shield true again; still one buffer.
- Non-Aegis with Hull r2: shield only at Run start, not on respawn (existing meta rule preserved).
- Phantom hit i-frames base 1.25 (existing path; keep coverage).
- Striker damage mult (existing; keep coverage).
- Unlock: 0, 24999, 25000, 75000, 150000 boundaries; career best update only when higher.
- Prior art: weapon tier matrix tests, meta hull shield tests, hangar unlock used max high score (replace with career best).

## Out of Scope

- New ship kits or weapon redesign / DPS rebalance
- Free-form loadouts or mid-Run ship swap
- Production art, GLBs, per-kit audio
- Meta upgrade or powerup catalog changes
- Playlist / enemy content changes
- Run HUD kit badges or detailed in-run ship panel
- Cloud saves, accounts, online unlocks

## Further Notes

- Domain vocabulary: **ship kit**, **ship passive**, **career best**, **Run**, **meta upgrade**, **powerup**. Unlocks are score milestones, not Scrap.
- Binding numbers: `docs/design/catalogs/ships.md` and weapons catalog for fire tables (already implemented). This PRD locks hitbox application, Aegis each-life shield, career-best unlocks, Hangar/Results identity, and placeholders.
- Success criterion: select each unlocked kit in Hangar with clear stats, Launch and feel hitbox/HP/passive/mobility differences, Aegis re-shields on respawn, a 25k career best unlocks Striker even without a top-10 slot, and meshes read as four silhouettes.
- Confirmed seams: world create/respawn + pure unlock/career-best helpers; shell/view manual smoke.
