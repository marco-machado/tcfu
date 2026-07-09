# Spend Scrap in the Upgrade bay and feel meta ranks in the next Run

Status: `resolved`
Blocked by: none

## Parent

`.scratch/meta-upgrade-bay/PRD.md`

## What to build

From Hangar, open the Upgrade bay, spend Scrap on Arsenal / Hull / Salvage / Thrusters ranks, and on Launch (or Quick retry) feel those ranks in combat and at Results — including Salvage Scrap mult — with progress persisted and Settings reset still wiping meta.

## Acceptance criteria

- [x] Hangar opens a dedicated Upgrade bay screen showing Scrap, four independent branches with rank pips (0–3), current and next effects, next cost (30 / 75 / 150) or MAX, and Buy only when affordable and not maxed.
- [x] Buying rank N requires N−1, deducts Scrap immediately, persists meta, and has no refunds; Back returns to Hangar; no mid-Run shopping.
- [x] Launch and Quick retry snapshot current ranks into the sim; Arsenal, Hull, Salvage combat modifiers, and Thrusters apply for that Run per the PRD (including Options/bomb not Arsenal-buffed, Hull start shield life-1 only, pity 35 s at Salvage 2+).
- [x] Results Scrap (and Run HUD estimate) use `floor(base × Salvage scrap mult)` with base `floor(score/100) + floor(waves × 5)`.
- [x] Settings Reset meta still clears Scrap and all ranks after confirm.
- [x] Pure purchase/rank-resolution tests and sim step tests with injected modifiers cover gates and combat effects; shell is manual smoke.

## Blocked by

None — can start immediately.

## Answer

Upgrade bay screen + pure purchase/modifiers; Launch snapshots combat meta into the world; Scrap mult from live Salvage ranks at Results/HUD; sim tests for ranks and effects.
