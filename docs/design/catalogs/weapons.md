# Catalog: Weapons

All weapons fire fixed **+Y**. Hold-to-fire on cooldown. Damage is per bullet unless noted. Default player bullet radius **0.12** unless overridden.

Striker passive `dmg_10` multiplies final damage after tier values.

## pulse_cannon (Vanguard)

| tier | pattern | dmg | cooldown_s | bullet_speed | bullet_r | pierce | notes |
|------|---------|-----|------------|--------------|----------|--------|-------|
| 0 | 1 center | 1 | 0.18 | 18 | 0.12 | 0 | Baseline |
| 1 | 1 center | 1 | 0.15 | 18 | 0.12 | 0 | Faster |
| 2 | 2 parallel ±0.25 | 1 | 0.15 | 18 | 0.12 | 0 | Twin |
| 3 | 3-way ±12° | 1 | 0.14 | 18 | 0.12 | 0 | Peak |

## twin_lance (Striker)

| tier | pattern | dmg | cooldown_s | bullet_speed | bullet_r | pierce | notes |
|------|---------|-----|------------|--------------|----------|--------|-------|
| 0 | 2 parallel ±0.3 | 1 | 0.14 | 20 | 0.12 | 0 | High DPS |
| 1 | 2 parallel ±0.3 | 1 | 0.12 | 20 | 0.12 | 0 | |
| 2 | 2 parallel ±0.3 | 1.5 | 0.12 | 22 | 0.12 | 0 | |
| 3 | 3 parallel | 1.5 | 0.11 | 22 | 0.12 | 0 | Peak stream |

## wide_pulse (Aegis)

| tier | pattern | dmg | cooldown_s | bullet_speed | bullet_r | pierce | notes |
|------|---------|-----|------------|--------------|----------|--------|-------|
| 0 | 2-way ±15° | 1 | 0.22 | 16 | 0.12 | 0 | Coverage |
| 1 | 3-way ±18° | 1 | 0.20 | 16 | 0.12 | 0 | |
| 2 | 3-way ±18° | 1 | 0.18 | 17 | 0.12 | 0 | |
| 3 | 5-way fan | 1 | 0.18 | 17 | 0.12 | 0 | Crowd control |

## needle (Phantom)

| tier | pattern | dmg | cooldown_s | bullet_speed | bullet_r | pierce | notes |
|------|---------|-----|------------|--------------|----------|--------|-------|
| 0 | 1 thin | 1 | 0.10 | 26 | 0.08 | 0 | High RoF |
| 1 | 1 thin | 1 | 0.08 | 26 | 0.08 | 0 | |
| 2 | 2 tight ±0.15 | 1 | 0.08 | 28 | 0.08 | 0 | |
| 3 | 2 tight ±0.15 | 1 | 0.07 | 28 | 0.08 | 1 | Pierce one enemy |

## Temporary modifiers (powerups)

- `rate_up`: multiply cooldown by **0.75** (after tier cooldown).
- `spread_up`: add **+2** side shots (dmg 1, share main cooldown), additive with pattern.
