# Core loop and scoring

Type: `grilling`
Status: resolved
Blocked by: 01

## Question

What is the full run flow and scoring model for endless survival?

Resolve: title → ship select/hangar → run → death → results → retry; life stock numbers; what increments score (kills, time, waves, pickups, no-damage); how score milestones feed ship unlocks; what “wave” means on an endless timeline; local high-score fields and when they write.

## Answer

**Core loop and scoring (locked)**

### Screen flow

`Title → Hangar (ship select + meta summary) → Run → Results → Hangar` (or Results → Title). Quick-retry same ship on Results is allowed. No mid-run ship swap. Title: play, settings (stub OK). Hangar: choose unlocked ship kit; show best score, unlock progress, meta entry. Results: score, time, wave, kills, PB?, unlocks, meta currency earned.

### Lives and death

- 3 lives; 3 HP per life (1 damage per standard hit unless combat ticket refines).
- HP → 0: lose a life; if lives remain, respawn center of band with invuln; clear nearby enemy bullets; enemies stay.
- Lives → 0: run ends → Results. No continues.
- I-frames / shield detail owned by Combat ticket; structure only here.

### Wave

- A wave = one scheduled wave pattern (or short chained group) completing its spawn window.
- Endless timeline = wave index 1, 2, 3…; HUD shows wave number.
- World stream never fully stops for a rest screen; brief spawn gaps OK.

### Scoring

| Source | Rule |
|--------|------|
| Kill | Enemy base points × wave multiplier |
| Wave clear | Flat bonus, light scale with wave index |
| Pickup | Small points (gameplay primary) |
| Survival tick | None (no score-per-second) |
| No-damage | End-of-wave bonus if no HP lost that wave |
| Death | No score loss |

- Wave multiplier: `1 + 0.05 × (waveIndex - 1)`, cap **3.0**.
- Display: integer score on HUD and Results.

### Ship unlocks

- Mechanism: single-run score at Results vs thresholds in `catalogs/ships.md`.
- Track career best single-run score.
- Threshold numbers owned by Ship roster ticket (placeholders non-binding).

### Meta currency (hook)

- Results grant meta currency; no mid-run spend.
- Provisional payout: `floor(score / 100) + floor(wavesCompleted × 5)`; Meta-upgrade tree may finalize.

### Local high scores

- Top 10 by score; fields: score, ship kit id, wave reached, time survived (s), timestamp.
- Write on Results if qualifies. `localStorage` (or equivalent). Offline only.

### Pause / clock

- Pause in Run freezes sim; focus loss auto-pauses.
- Elapsed run time = sim time excluding pause; no hard time limit.

### Doc homes

- Flow/lives/scoring/wave def/unlock mechanism/high-score fields → `DESIGN.md` § core loop.
- Enemy points → `enemies.md`; ship thresholds → `ships.md`; meta formula final → meta ticket.

Confirmed by user (batch accept).
