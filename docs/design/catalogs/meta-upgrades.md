# Catalog: Meta upgrades

Persistent **Scrap** tree. Hangar Upgrade bay only. No refunds. Does not buy ships.

## Currency

| Field | Value |
|-------|-------|
| Name | Scrap |
| Grant | Results: `floor(score/100) + floor(wavesCompleted×5)` |
| Salvage r3 | ×1.15 on that payout |
| Save key | `tcfu.meta` → `{ scrap, ranks: { arsenal, hull, salvage, thrust } }` |

## Costs (each branch)

| Rank | Scrap |
|------|-------|
| 1 | 30 |
| 2 | 75 |
| 3 | 150 |

Ranks are linear within a branch (must own N−1 to buy N). Branches independent.

## Branches

### Arsenal

| rank | id | effect |
|------|-----|--------|
| 1 | arsenal_1 | Weapon damage +5% |
| 2 | arsenal_2 | Weapon damage +10% total |
| 3 | arsenal_3 | Weapon damage +15% total; W-cell earn +10% |

### Hull

| rank | id | effect |
|------|-----|--------|
| 1 | hull_1 | Hit i-frames +0.15 s |
| 2 | hull_2 | Start of run: shield buffer on life 1 (all ships) |
| 3 | hull_3 | Max bombs +1 (e.g. 6); starting bombs +1 (clamp max) |

### Salvage

| rank | id | effect |
|------|-----|--------|
| 1 | salvage_1 | Powerup drop chance ×1.15 |
| 2 | salvage_2 | Drop chance ×1.30 total; pity timer 35 s |
| 3 | salvage_3 | Scrap earn +15% |

### Thrusters

| rank | id | effect |
|------|-----|--------|
| 1 | thrust_1 | Move speed +5% |
| 2 | thrust_2 | Move speed +10% total |
| 3 | thrust_3 | Move speed +15% total; forward band max Y +0.5 |

## Settings

Reset all meta with confirm (clears ranks and optionally scrap — implement as full wipe of `tcfu.meta`).
