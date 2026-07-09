# Meta-upgrade tree

Type: `grilling`
Status: resolved
Blocked by: 02, 07

## Question

What is the persistent meta-upgrade tree?

Resolve: meta currency (how earned, when granted); tree structure and node types; what may be permanently upgraded vs reserved for run-only systems; interaction with ship unlocks by score; soft caps and anti-snowball intent for endless survival.

## Answer

**Meta-upgrade tree (locked)**

### Currency

- **Scrap**, granted at Results only: `floor(score/100) + floor(wavesCompleted×5)`; salvage rank 3 adds +15% to payout.
- Spend in Hangar Upgrade bay only; no refunds; no ship purchases (ships stay score unlocks).

### Structure

- 4 independent branches × 3 ranks (linear within branch).
- Costs per rank: 30 / 75 / 150 Scrap.
- Small bonuses only (anti-snowball).

### Branches

| Branch | Ranks (summary) |
|--------|-----------------|
| **Arsenal** | +5% / +10% / +15% weapon damage; r3 also +10% W-cell earn |
| **Hull** | +0.15s hit i-frames; r2 start-of-run shield (life 1); r3 +1 max bombs (max 6) and +1 starting bombs |
| **Salvage** | drop ×1.15 / ×1.30 + pity 35s; r3 scrap +15% |
| **Thrusters** | move +5% / +10%; r3 also +0.5 forward band |

### Stacking

`damage = weapon × shipPassive × (1+arsenal)`; `move = base × shipMult × (1+thrust)`; drops × salvage mult.

### Save

`tcfu.meta`: `{ scrap, ranks: { arsenal, hull, salvage, thrust } }` 0–3. Settings: reset all meta with confirm.

### Catalogs

`meta-upgrades.md` + DESIGN § Progression.

Confirmed by user (batch accept).
