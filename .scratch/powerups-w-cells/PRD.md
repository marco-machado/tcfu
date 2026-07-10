# Powerups and W-cells

Status: `resolved`

## Problem Statement

The current Run has its core combat loop, but it lacks the two progression systems that make combat evolve during a Run: W-cells earned from kills for permanent-within-the-Run weapon tiers, and collectible powerups that create immediate or timed advantages. The HUD currently exposes only a static weapon tier and players cannot collect, see, or benefit from either system.

## Solution

Add authoritative simulation support for W-cell run upgrades and powerups. Enemy kills award W-cells by enemy class and automatically advance the current ship kit's weapon tier at the catalog thresholds. Enemies can drop visible, collectible powerups according to the catalog's chance, weighting, pity, and on-field-cap rules. Powerups apply their specified instant, persistent, or timed effect; timed effects refresh rather than stack. The Run HUD communicates W-cell progress, weapon tier, and active timed powerups.

## User Stories

1. As a player, I want each enemy kill to award W-cells according to its class, so that dangerous enemies advance my Run upgrade progress more meaningfully.
2. As a player, I want W-cells to remain earned after I lose a life, so that a setback does not erase the combat progress I built during the Run.
3. As a player, I want W-cells and weapon tier to reset when a new Run begins, so that each Run starts from its ship kit's tier-0 weapon.
4. As a player, I want my weapon to automatically reach tier 1 at 20 cumulative W-cells, so that I do not need to interrupt arcade play to spend a currency.
5. As a player, I want my weapon to automatically reach tier 2 at 50 cumulative W-cells, so that stronger survival earns a visibly stronger weapon.
6. As a player, I want my weapon to automatically reach tier 3 at 100 cumulative W-cells, so that a Run has a clear maximum run-upgrade state.
7. As a player, I want tier 3 to be the maximum W-cell tier, so that extra W-cells do not create unbounded weapon strength.
8. As a Vanguard pilot, I want each W-cell tier to use the pulse-cannon pattern and statistics from the weapon catalog, so that tiers change cadence and shot geometry as designed.
9. As a Striker, Aegis, or Phantom pilot, I want W-cell tiers to apply to that kit's own weapon line, so that ship kit identities remain distinct.
10. As a player, I want a HUD indication of my current tier and progress to the next threshold, so that I can understand how close I am to the next run upgrade.
11. As a player, I want eligible killed enemies to sometimes create a powerup pickup, so that enemy kills create moments of movement, risk, and reward.
12. As a player, I want different enemy classes to use their configured powerup drop chances, so that tougher enemies are more rewarding.
13. As a player, I want a weighted selection among the six powerup types, so that common and rare effects follow the designed economy.
14. As a player, I want the next grunt-or-higher kill to guarantee a powerup after 45 seconds without one, so that a long dry spell does not make pickups feel absent.
15. As a player, I want no more than three powerups to be active on the playfield, so that pickup clutter and missed rewards stay bounded.
16. As a player, I want pickups that leave the playfield to disappear, so that stale objects cannot accumulate outside the movement band.
17. As a player, I want to collect a powerup by moving my ship into it, so that pickups are a readable movement objective rather than an automatic reward.
18. As a player, I want collecting any powerup to grant a small flat score bonus, so that pickups contribute to my Run score while gameplay value remains primary.
19. As a player, I want Shield to grant one shield buffer and refresh an existing buffer to one, so that it absorbs the next valid hit under existing combat rules.
20. As a player, I want Bomb to add one bomb without exceeding my kit's maximum, so that it is useful without bypassing the stock cap.
21. As a player, I want Repair to restore one HP without exceeding maximum HP, so that recovery remains limited and no passive regeneration is introduced.
22. As a player, I want Overclock to reduce my current tier's weapon cooldown by 25% for eight seconds, so that it creates a temporary firing-rate spike.
23. As a player, I want a second Overclock pickup to refresh its duration rather than multiply its effect, so that the effect stays bounded.
24. As a player, I want Options to add two damage-1 side shots for eight seconds while retaining the weapon's normal firing cadence, so that it increases coverage without replacing my ship kit weapon.
25. As a player, I want a second Options pickup to refresh its duration rather than add more side shots, so that spread does not grow without limit.
26. As a player, I want Bounty to double kill score for ten seconds, so that I can prioritize destroying threats during its window.
27. As a player, I want Bounty refreshes not to produce a four-times multiplier, so that the score economy stays bounded.
28. As a player, I want timed powerups to expire naturally and be shown while active, so that their temporary state is clear and predictable.
29. As a player, I want shield state to clear on life loss under existing combat rules, so that Shield remains a combat buffer rather than a persistent life upgrade.
30. As a player, I want powerup behavior to remain authoritative in the simulation, so that rendering and HUD updates cannot alter combat outcomes.

## Implementation Decisions

- Preserve the three-layer architecture: the simulation owns W-cell, weapon, drop, pickup, timer, score, and effect state; the R3F view presents pickup entities; the DOM shell HUD reads the world state.
- Extend enemy/catalog data so every spawnable enemy has a class. W-cell awards are 1 for fodder, 2 for grunt, 5 for elite, and 15 for set-piece. The currently implemented drone and dart are fodder; gunner is grunt.
- Award W-cells once, at the same authoritative kill boundary used for score and kill count, including kills caused by player bullets and bombs. A kill must never award its W-cells or roll its drop more than once.
- Store cumulative Run W-cells and derive the capped weapon tier from the fixed thresholds 20, 50, and 100. The state resets only through new-world/Run initialization and is not altered by respawn.
- Replace the tier-0-only player-fire behavior with a catalog-backed weapon resolver keyed by ship kit and current tier. It produces the documented cooldown, bullet speed, radius, damage, pattern geometry, and Phantom tier-3 single-enemy pierce behavior.
- Apply `rate_up` after resolving the current weapon-tier cooldown. Apply `spread_up` as exactly two additional damage-1 side shots using the same resolved cooldown; it is additive to the base weapon pattern.
- Add a bounded pickup entity pool to the World. Each active pickup has an id/type, position, collision radius, and any presentation-facing state needed by the view; it moves with the world stream and is culled off-playfield.
- Roll a drop at the authoritative enemy-kill boundary only if fewer than three pickups are active. Base chances are fodder 4%, grunt 8%, elite 25%, and set-piece guaranteed one useful drop. Use the documented weighted table: shield 20%, bomb_stock 15%, repair 15%, rate_up 20%, spread_up 15%, score_mult 15%.
- Define the deterministic/random seam for drop selection as an injectable or world-owned random source, so simulation tests can assert chance, weights, and pity behavior without relying on nondeterministic global randomness.
- Track the elapsed time since the most recently spawned or collected powerup consistently in the simulation. After 45 seconds without a powerup, the next eligible grunt-or-higher kill forces the weighted-drop path, subject to the on-field cap. Salvage meta modifiers and its 35-second pity threshold are out of scope until meta upgrades are active.
- Support the catalog's authored forced drop for intro_03 through an explicit wave/pattern spawn directive. Its eligible result is `rate_up` or `shield`; it follows the pickup on-field cap.
- Apply powerup collection at ship-versus-pickup collision. Shield sets the existing shield buffer; Bomb and Repair clamp to existing max state; timed modifiers use remaining-duration timers and refresh their own timer only; Bounty is boolean/timer state, never an accumulating multiplier.
- Apply Bounty only to kill-score calculation, after the existing wave multiplier. Wave-clear bonuses, pickup score, Scrap payout, and W-cell awards are not doubled.
- Establish the pickup score as a named gameplay constant. The exact small flat value is not currently specified by the design catalogs and must be selected once by the implementing issue before code is merged; it must be positive, fixed, and rendered through the normal score field.
- Display current W-cell total, tier pips/progress toward the next threshold, and active timers for Overclock, Options, and Bounty in the Run HUD. Shield and bombs remain represented by their existing HUD values.
- Pickup meshes use the established pickup readability direction (gold/green family) but visual polish, VFX, audio, and rumble remain independent presentation work.

## Testing Decisions

- Test external simulation behavior through the existing `stepWorld(world, dt, commands)` seam. Tests set up a World, step it, and assert observable state such as W-cells, tier, bullet patterns, pickups, effects, timers, HP, bombs, score, and active entities.
- Extend the existing simulation-step test suite and its world construction/placement helpers rather than introducing renderer-driven tests for mechanics.
- Use a deterministic random seam in tests to exercise successful and failed drop rolls, weighted type selection, forced pattern drops, pity forcing, and the three-pickup cap.
- Verify each enemy class awards the documented W-cells on a kill and that bullet and bomb kills award exactly once.
- Verify thresholds at 20, 50, and 100, the tier-3 cap, new-Run reset, and preservation across a simulated life loss.
- Verify each ship kit's tier resolution produces the observable shot count/geometry, cooldown, damage, speed, radius, and Phantom tier-3 pierce behavior from the catalog.
- Verify pickup spawn, world-stream movement/culling, player collision collection, and pickup score.
- Verify all instant effects clamp correctly; Shield follows the existing damage flow; each timed effect works until expiration; duplicate timed pickups refresh only their own timer; Bounty never exceeds two-times kill score.
- Verify Bounty affects kill score but not wave-clear rewards, pickup score, W-cell gain, or Scrap estimates.
- Verify the pity timer does not force fodder kills, forces the next eligible kill after the dry interval, and respects the on-field cap.
- Existing `stepWorld` tests for fire, score, bomb kills, shield, damage, life loss, and Run reset are the primary prior art. Tests must not assert pool indexes, helper names, or rendering implementation details.

## Out of Scope

- Meta-upgrade purchase UI, persistence effects, and rank modifiers, including Arsenal's W-cell bonus and Salvage's drop/pity modifiers.
- New enemies, the complete 24-pattern content catalog, and set-piece implementation beyond supporting their documented classifications when they become available.
- Broader combat changes unrelated to the specified W-cell weapon tiers and powerup effects.
- New visual assets, particle effects, sound effects, gamepad rumble, and art polish for pickups.
- Any manual W-cell spending UI, loadout system, or persistent conversion of W-cells between Runs.
- Any powerup types or stack rules outside the six catalog entries.

## Further Notes

- Terminology is deliberate: a **Run upgrade** is W-cell progression within the current Run; a **Powerup** is a collectible mid-Run effect; a **Meta upgrade** is persistent Scrap progression. Do not use “upgrade” where the distinction is material.
- Binding gameplay values come from the powerups, run-upgrades, weapons, enemies, and wave-pattern catalogs. Where the catalog does not name a pickup-score amount, the implementation issue must lock the single constant before implementation.
- The initial vertical-slice PRD explicitly deferred both systems; this specification supersedes that deferral only for W-cell progression and powerup economy/effects.
