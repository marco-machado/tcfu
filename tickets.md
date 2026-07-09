# Tickets: Powerups and W-cells

Tracer-bullet implementation tickets for [the powerups and W-cells specification](.scratch/powerups-w-cells/PRD.md). Work the frontier: any ticket whose blockers are complete.

## W-cell weapon progression

**What to build:** Make every enemy kill advance the current Run's W-cell progression according to enemy class, automatically change the selected ship kit's weapon through its tier ladder, and make that progression legible in the Run HUD.

**Blocked by:** None — can start immediately.

- [x] Killing a fodder, grunt, elite, or set-piece awards 1, 2, 5, or 15 W-cells respectively, exactly once for both bullet and bomb kills.
- [x] Reaching 20, 50, and 100 cumulative W-cells automatically reaches tiers 1, 2, and 3; tier 3 is capped; progress survives life loss and resets for a new Run.
- [x] All ship kits resolve their documented tier-specific weapon cadence, pattern, projectile statistics, and Phantom tier-3 pierce behavior.
- [x] The Run HUD displays current W-cells, tier pips, and progress to the next tier.
- [x] Simulation tests prove the observable award, threshold, reset, respawn, and weapon behavior without asserting implementation details.

## Collectible instant powerups

**What to build:** Make a bounded on-playfield pickup entity a player can see, chase, collect, and score from, with Shield, Bomb, and Repair delivering their instantaneous combat effect.

**Blocked by:** None — can start immediately.

- [x] Active pickups stream through and cull from the playfield, and no more than three may be active at once.
- [x] Ship-versus-pickup collision collects the item and awards one named, positive, fixed pickup-score value; the implementer selects and documents that currently unspecified value.
- [x] Shield refreshes the shield buffer; Bomb adds one stock without exceeding maximum; Repair restores one HP without exceeding maximum HP.
- [x] Pickup presentation is visible and readable in the Run without making the view authoritative for pickup state.
- [x] Simulation tests cover spawn/setup, movement/culling, collection, score, cap, and all three clamped effects.

## Timed powerup combat effects

**What to build:** Extend collectible powerups with the timed Overclock, Options, and Bounty effects, so a player can read, use, refresh, and outlast temporary combat advantages.

**Blocked by:** Collectible instant powerups.

- [x] Overclock applies a 0.75 multiplier after the current tier's base cooldown for eight seconds and refreshes rather than stacks.
- [x] Options adds exactly two damage-1 side shots on the normal resolved cooldown for eight seconds and refreshes rather than adds further shots.
- [x] Bounty doubles kill score for ten seconds, refreshes rather than becomes four-times, and does not affect W-cells, pickup score, wave-clear rewards, or Scrap.
- [x] The Run HUD visibly reports all active timed effects and their remaining durations.
- [x] Simulation tests cover each effect, expiry, refresh, interaction with tiered weapons, and Bounty's score boundary.

## Powerup drop economy and authored guarantee

**What to build:** Make enemy kills produce powerups according to the designed probability, weighting, dry-spell protection, and intro-wave guarantee, while retaining deterministic simulation tests.

**Blocked by:** Collectible instant powerups.

- [x] Eligible kill drops use 4% fodder, 8% grunt, 25% elite, and guaranteed set-piece chances, then select the six powerups with the documented weights.
- [x] A deterministic random seam makes successful/failed rolls and weighted selection repeatable in simulation tests.
- [x] After 45 seconds with no powerup, the next grunt-or-higher kill forces a weighted drop unless the three-pickup cap prevents it; fodder kills do not consume the pity guarantee.
- [x] Intro_03 produces its authored forced Shield-or-Overclock pickup while respecting the on-field cap.
- [x] Simulation tests cover all probability boundaries, weights, cap behavior, pity eligibility, and the authored guarantee.
