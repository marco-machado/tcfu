# Meta Upgrade Bay

Status: `resolved`

## Problem Statement

Players already earn Scrap at Results and see a balance in the Hangar, but they cannot spend it. The Upgrade bay is a stub, meta ranks never change gameplay, and Salvage bonuses do not affect drop pity or Scrap payout. Across-run progression is incomplete: currency accrues with nowhere to go, so the designed meta tree is invisible in play.

## Solution

Ship a complete Hangar **Upgrade bay** and make **meta upgrades** real. Players spend **Scrap** on the four catalog branches (Arsenal, Hull, Salvage, Thrusters), ranks persist in the existing meta save, and each **meta rank** applies its catalog effects on subsequent **Runs**. Combat modifiers enter the sim only as an immutable snapshot at Launch / Quick retry; Scrap earn mult at Results follows current Salvage rank.

## User Stories

1. As a player, I want an Upgrade bay entry from the Hangar, so that I can open progression without hunting Settings.
2. As a player, I want the Upgrade bay to show my current Scrap balance, so that I know what I can afford.
3. As a player, I want four independent branches (Arsenal, Hull, Salvage, Thrusters), so that I can specialize progression.
4. As a player, I want each branch to show owned meta rank pips from 0 to 3, so that progress is legible at a glance.
5. As a player, I want to see the effect of my current rank and the next rank on each branch, so that I understand what I am buying.
6. As a player, I want the next rank cost shown when I can still upgrade (30 / 75 / 150), so that pricing is clear before purchase.
7. As a player, I want a branch marked MAX when it is rank 3, so that I do not hunt for further ranks that do not exist.
8. As a player, I want Buy disabled when I cannot afford the next rank, so that failed spends do not surprise me.
9. As a player, I want Buy disabled when a branch is already maxed, so that the control matches state.
10. As a player, I want buying rank N to require owning rank N−1, so that progression stays linear within a branch.
11. As a player, I want branches to be independent, so that Arsenal progress does not gate Hull.
12. As a player, I want a successful purchase to deduct Scrap immediately and raise the branch rank, so that the spend feels instant.
13. As a player, I want purchases to persist across browser reloads, so that meta progress is not lost.
14. As a player, I want no refunds or respec, so that Scrap spends are permanent commitments.
15. As a player, I want to return from the Upgrade bay to the Hangar, so that I can Launch after shopping.
16. As a player, I want no Upgrade bay access mid-Run or from Results, so that shopping never interrupts arcade combat.
17. As a player, I want Hangar to stop saying the Upgrade bay “comes later,” so that the product matches reality.
18. As a player with Arsenal rank 1, I want weapon damage increased by 5%, so that early meta investment is felt.
19. As a player with Arsenal rank 2, I want weapon damage increased by 10% total (not stacked ad hoc on top of rank 1 wording), so that the catalog totals hold.
20. As a player with Arsenal rank 3, I want weapon damage increased by 15% total, so that the branch caps as designed.
21. As a player with Arsenal rank 3, I want W-cell earn increased by 10%, so that late Arsenal accelerates Run upgrades.
22. As a Striker pilot with Arsenal ranks, I want ship passive damage and Arsenal to multiply together, so that kit identity and meta stack as designed.
23. As a player with Options active, I want those side shots to stay damage 1, so that Arsenal does not rewrite powerup rules.
24. As a player using bomb, I want bomb damage unchanged by Arsenal, so that panic clear stays cataloged.
25. As a player with Hull rank 1+, I want hit i-frames extended by 0.15 s, so that recovery after HP damage is slightly safer.
26. As a player, I want respawn, shield-absorb, and bomb i-frames unaffected by Hull rank 1, so that only hit recovery is tuned.
27. As a player with Hull rank 2+, I want a shield buffer at the start of the Run on life 1, so that early survival improves without free respawn shields.
28. As a player with Hull rank 2+, I want that start shield not re-granted on respawn, so that life loss still costs the buffer.
29. As an Aegis pilot with Hull rank 2, I want one shield buffer at most at Run start, so that buffers do not stack past one.
30. As a player with Hull rank 3, I want max bombs increased by 1 and starting bombs increased by 1 (clamped to max), so that stock is stronger without uncapped pickup abuse.
31. As a player with Salvage rank 1, I want powerup drop chance multiplied by 1.15, so that pickups appear more often.
32. As a player with Salvage rank 2, I want drop chance multiplied by 1.30 total and pity at 35 s, so that dry spells end sooner.
33. As a player with Salvage rank 2+, I want fodder kills still not consume pity eligibility, so that existing drop economy rules remain honest.
34. As a player with Salvage rank 3, I want Scrap earned at Results multiplied by 1.15 on the base payout, so that meta investment feeds further meta.
35. As a player, I want Results and Run HUD Scrap estimates to use the same Salvage Scrap mult, so that the number I chase matches the payout.
36. As a player with Thrusters rank 1, I want move speed increased by 5%, so that the ship feels slightly snappier.
37. As a player with Thrusters rank 2 or 3, I want move speed increased by 10% total, so that the branch cap is clear.
38. As a player with Thrusters rank 3, I want the forward movement band max Y extended by 0.5, so that I can hold a slightly more aggressive line.
39. As a player, I want Thrusters rank 3 not to change camera, spawn, or stream geometry, so that only player clamp expands.
40. As a player, I want accel and decel unchanged by Thrusters, so that handling weight stays familiar.
41. As a player, I want meta combat effects frozen for the whole Run at Launch, so that a Run’s difficulty of play does not shift mid-session.
42. As a player, I want Quick retry to re-snapshot current meta ranks into a fresh world, so that buys made after a prior Results visit still apply on the next Launch path.
43. As a player, I want Settings Reset meta (with confirm) to clear Scrap and all ranks, so that I can wipe progression without a separate bay control.
44. As a player, I want ship unlocks to remain score-based, so that Scrap never buys ship kits.
45. As a developer, I want meta purchase rules testable without React or localStorage, so that afford/rank gates stay deterministic.
46. As a developer, I want combat meta effects injectable into world create for sim tests, so that rank effects are proven at the same seam as other combat behavior.
47. As a developer, I want the sim not to read live persist or session stores while stepping, so that authority stays pure and ADR-aligned.

## Implementation Decisions

- Preserve the three-layer architecture: shell owns Upgrade bay UI, purchase actions, and meta persist; sim owns combat application of a modifiers snapshot; view stays presentation-only.
- Follow ADR `0001-meta-modifiers-snapshot-at-run-start`: at Launch and Quick retry, resolve current meta ranks into a pure modifiers snapshot and pass it into world create/reset. The sim never loads meta mid-step.
- Keep the existing meta save shape: Scrap integer plus ranks for arsenal, hull, salvage, and thrust (each 0–3). No schema redesign; sanitize/clamp on load.
- Purchase only from the Upgrade bay. A pure purchase function accepts meta state and branch id, enforces linear rank gates and costs 30 / 75 / 150, deducts Scrap, increments rank, and returns the next meta state (or rejection). Shell persists on success and refreshes session meta.
- No refunds, respec, bulk multi-rank buy, or mid-Run shopping.
- Add a dedicated shell screen for the Upgrade bay (reachable from Hangar, back to Hangar). Hangar shows Scrap and an Upgrade bay control; remove the “comes later” stub copy.
- Bay UI is readable DOM: Scrap header; four branch cards with rank pips, current and next effect blurbs from the meta catalog, next cost or MAX, and Buy when eligible.
- Resolve ranks into modifiers roughly:

  - weapon damage mult: 1 / 1.05 / 1.10 / 1.15 by Arsenal rank
  - W-cell earn mult: 1.10 at Arsenal 3, else 1
  - hit i-frames bonus: +0.15 s when Hull ≥ 1 (hit path only)
  - start-run shield: true when Hull ≥ 2 (life 1 only; not on respawn)
  - bomb max bonus and start bonus: +1 each when Hull ≥ 3, start clamped to max
  - drop chance mult: 1 / 1.15 / 1.30 by Salvage rank
  - pity seconds: 35 when Salvage ≥ 2, else 45
  - Scrap earn mult: 1.15 when Salvage ≥ 3, else 1 (Results and estimates; not frozen combat state)
  - move speed mult: 1 / 1.05 / 1.10 by Thrusters rank (rank 3 stays 1.10)
  - band max Y bonus: +0.5 when Thrusters ≥ 3

- Weapon damage stacking: catalog shot damage × ship passive × Arsenal mult. Fractional damage is allowed (already used for Striker passive). Options side shots remain fixed damage 1. Bomb damage is not Arsenal-scaled.
- W-cell awards multiply by W-cell earn mult and may be fractional; tier thresholds remain 20 / 50 / 100 on the cumulative total.
- Drop rolls use `min(1, baseChance × dropChanceMult)` with existing weights, on-field cap, pity eligibility, and deterministic RNG seam.
- Scrap at Results: `base = floor(score/100) + floor(wavesCompleted × 5)`; `scrapEarned = floor(base × scrapEarnMult)`. Preserve breakdown of score/wave parts; total applies Salvage mult. HUD estimate uses the same formula with current meta.
- Movement: max speed uses base × ship move mult × Thrusters mult when ship mult is applied. Accel/decel unchanged. Thrusters rank 3 extends forward movement band max Y by 0.5 before existing hull half-extents and top safe margin; camera and spawn geometry unchanged.
- Hull hit i-frames: base hit duration (including ship kit base when Phantom iframe passive is applied) plus Hull bonus. Respawn, shield absorb, and bomb i-frames unchanged.
- Settings Reset meta remains a full wipe of Scrap and ranks (already present); no second wipe control in the bay.
- Ship unlocks remain score milestones only; Scrap never purchases kits.
- Modules to deepen: meta persist helpers (purchase/sanitize as needed), meta→modifiers resolver, world create/reset accepting modifiers, sim step paths for damage, W-cells, i-frames, start shield, bombs, drops, pity, move, band clamp; Scrap summary/HUD helpers; session startRun wiring; Hangar + Upgrade bay shell screens; screen id routing.

## Testing Decisions

### What makes a good test

- Assert external behavior only: given inputs (meta ranks, world setup, steps, commands), observe Scrap after purchase, modifiers-driven combat outcomes, drop/pity behavior, Scrap earned, move clamp, and rank gates.
- Do not assert React trees, CSS, localStorage key strings as the primary contract (except pure load/save helpers if already pattern-tested), pool slot indexes, private helper names, or R3F meshes.
- Prefer deterministic setups: pure functions for purchase and rank resolution; inject modifiers and RNG into the world for sim steps.

### Seams (few, high)

1. **Primary combat seam (existing):** world create with modifiers + `stepWorld` — prove all combat meta effects (damage, W-cells, hit i-frames, start shield, bombs, drops, pity, move speed, band max Y).
2. **Purchase / rank resolution seam (new pure functions, no React):** try-buy and ranks→modifiers — prove costs, linear gates, max rank, Scrap math, and modifier table mapping.
3. **Scrap payout helper (existing summary/constants path, extended):** prove base Scrap and Salvage mult without mounting shell screens.

Shell routing and DOM layout are manual smoke only for this PRD.

### Coverage expectations

- Purchase: insufficient Scrap, max rank, missing prior rank, successful 0→1 / 1→2 / 2→3, independent branches, no refund path required beyond absence of API.
- Modifiers table: each rank threshold maps to the documented mults/flags.
- Arsenal: damage mult on kit weapon shots; Options stay 1; bomb unbuffed; W-cell mult only at rank 3; stacks with Striker passive.
- Hull: hit i-frames +0.15; start shield only at Run start; no respawn re-grant; bomb max/start +1 with clamp.
- Salvage: drop mults; pity 35 s at rank 2+; Scrap `floor(base × 1.15)` at rank 3; fodder still does not consume pity.
- Thrusters: speed mults; band max Y +0.5 only at rank 3; accel/decel unchanged if observable.
- Run reset / new world: modifiers apply at create; default modifiers are neutral when ranks are zero.
- Prior art: existing sim step suite for fire, damage, shield, bomb, drops, pity, W-cells, and reset; extend those patterns rather than inventing browser E2E for this feature.

## Out of Scope

- Ship unlock redesign or Scrap-priced ships
- Refunds, respec, rank downgrade, multi-rank bulk purchase
- New meta branches, cost rebalance, or effect redesign beyond the catalog
- Mid-Run or Results shopping
- Fancy Upgrade bay art, VFX, audio, rumble
- Full Settings redesign beyond existing Reset meta
- Fixing unrelated kit bugs (e.g. Aegis shield-on-every-life if still wrong vs ship catalog) unless required for Hull r2 correctness at Run start
- Elites, set-pieces, full 24-pattern content, art pipeline
- Input rebinding, accounts, cloud meta sync

## Further Notes

- Domain vocabulary is mandatory: **Scrap**, **meta upgrade**, **meta rank**, **Upgrade bay**, **Run**, **Run upgrade**, **powerup**, **ship kit**. Do not call ship unlocks meta upgrades; do not call W-cells Scrap.
- Binding numbers live in `docs/design/catalogs/meta-upgrades.md` and DESIGN stacking formulas; this PRD locks interpretation where the catalog was ambiguous (fractional damage, Options/bomb exclusion, Hull r2 first life only, Scrap floor after base, Upgrade bay as own screen, modifiers snapshot).
- Success criterion: a player can earn Scrap on Results, open the Upgrade bay from Hangar, buy at least one rank, Launch, and feel the corresponding catalog effect; Settings reset clears progression; sim tests cover purchase gates and combat modifiers without UI automation.
- Confirmed testing strategy: combat via existing step seam with injected modifiers; purchase/resolver as pure functions; Scrap mult on summary/constants helpers; shell is manual smoke.
