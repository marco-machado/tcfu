# Weapons, powerups, and run upgrades

Type: `grilling`
Status: resolved
Blocked by: 06, 04

## Question

What are the catalogs and rules for weapons, mid-run powerups, and in-run upgrade tiers?

Resolve: weapon behaviors and which ships start with what; powerup list, duration/stacking rules, spawn policy; run-upgrade ladder (how tiers are earned, what each tier changes, reset-on-run-end); naming kept consistent with `CONTEXT.md`.

## Answer

**Weapons, powerups, and run upgrades (locked)**

### Separation

- **Weapon** = kit gun + tier 0–3 pattern ladder (ids: `pulse_cannon`, `twin_lance`, `wide_pulse`, `needle`).
- **Run upgrade** = W-cells → auto tier-up; resets on run end; **kept across life loss**.
- **Powerup** = mid-run pickups (timed or instant); distinct from meta.

### Weapons (summary)

- All fixed +Y; hold-to-fire on cooldown.
- Tier tables as recommended (pulse twin→spread; lance DPS; wide fan; needle RoF + pierce at t3).
- Striker +10% damage applies after tier damage.
- Needle t3: pierce 1; default bullet radii per Combat unless overridden (needle r=0.08).

### Run upgrades (W-cells)

- Earn: fodder 1 / grunt 2 / elite 5 / set-piece 15.
- Auto thresholds: tier1 @ 20, tier2 @ 50, tier3 @ 100 cumulative W-cells.
- Max tier 3; reset on run end only.

### Powerups

| Id | Effect | Duration / stack |
|----|--------|------------------|
| `shield` | Combat shield buffer | Until break/life; refresh to 1 |
| `bomb_stock` | +1 bomb max 5 | Instant |
| `repair` | +1 HP clamp | Instant |
| `rate_up` | cooldown ×0.75 | 8s refresh |
| `spread_up` | +2 side shots | 8s refresh |
| `score_mult` | kill score ×2 | 10s refresh |

Spawn: death chances 4/8/25% + set-piece guarantee; weights as recommended; pity 45s; max 3 on field.

### Catalogs

`weapons.md`, `powerups.md`, `run-upgrades.md` hold the tables; ship→weapon in `ships.md`.

Confirmed by user (batch accept).
