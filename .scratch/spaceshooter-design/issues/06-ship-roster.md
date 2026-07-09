# Ship roster and kits

Type: `grilling`
Status: resolved
Blocked by: 02

## Question

What is the v1 ship roster?

Resolve: how many ships; each ship’s fantasy/role; base stats; starting weapon identity; score milestone unlock thresholds; what is deliberately shared vs unique across kits. No free-form loadout builder.

## Answer

**Ship roster and kits (locked)**

### Roster (4 kits)

| Id | Unlock (single-run score) | Role | move_mult | hitbox_r | hp/life | bombs | weapon_id | passive |
|----|---------------------------|------|-----------|----------|---------|-------|-----------|---------|
| `vanguard` | 0 (start) | Balanced | 1.0× | 0.35 | 3 | 2 | `pulse_cannon` | none |
| `striker` | 25_000 | Offense | 1.15× | 0.32 | **2** | 2 | `twin_lance` | +10% weapon damage |
| `aegis` | 75_000 | Defense | 0.9× | 0.38 | 3 | **3** | `wide_pulse` | start each life with shield buffer |
| `phantom` | 150_000 | Mobility | 1.25× | 0.28 | 3 | 2 | `needle` | hit i-frames 1.25s (respawn stays 2.0s) |

### Shared

- Lives structure, bomb max 5, band/controls, powerup/run-upgrade/meta systems, fixed +Y fire.
- No free-form loadout; kit chosen in Hangar only.

### Unique

- Fantasy, speed mult, hitbox, starting weapon id, optional passive, art tag (see ticket recommendations for blurbs/art tags).

### Catalog

`ships.md` columns: `id | name | unlock_score | move_mult | hitbox_r | hp_per_life | start_bombs | weapon_id | passive_id | blurb`

### Hangar

Unlocked only; locked show threshold; remember last ship; no mid-run swap.

### Balance intent

Vanguard is tuning baseline; unlocks expand fantasy/ceiling, not obsolete starter.

Confirmed by user (batch accept).
