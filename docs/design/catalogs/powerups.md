# Catalog: Powerups

Mid-run pickups. Distinct from run upgrades (W-cells) and meta (Scrap).

## Effects

| id | name | effect | duration | stack |
|----|------|--------|----------|-------|
| shield | Shield | +1 shield buffer (Combat) | Until break / life loss | Refresh to 1 |
| bomb_stock | Bomb | +1 bomb (clamp max; meta may raise max) | Instant | n/a |
| repair | Repair | +1 HP (clamp kit max) | Instant | n/a |
| rate_up | Overclock | Weapon cooldown × 0.75 | 8 s | Refresh duration |
| spread_up | Options | +2 side shots (dmg 1) | 8 s | Refresh duration |
| score_mult | Bounty | Kill score × 2 | 10 s | Refresh; no ×4 |

Pickup score: small flat points (gameplay primary).

## Spawn

| Source | Base drop chance |
|--------|------------------|
| Fodder death | 4% |
| Grunt death | 8% |
| Elite death | 25% |
| Set-piece death | Guaranteed 1 useful drop |

### Weights (when a drop rolls)

| id | weight |
|----|--------|
| shield | 20% |
| bomb_stock | 15% |
| repair | 15% |
| rate_up | 20% |
| spread_up | 15% |
| score_mult | 15% |

### Pity / caps

- If no powerup for **45 s** run time (or **35 s** with Salvage rank 2+), next grunt-or-higher kill forces a weighted drop.
- Max **3** pickups on field; skip new drops at cap.
- Salvage meta multiplies drop chance (×1.15 / ×1.30).
