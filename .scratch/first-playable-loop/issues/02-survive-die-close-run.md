# Survive, die, and close the Run

Status: `ready-for-agent`
Blocked by: 01

## Parent

`.scratch/first-playable-loop/PRD.md`

## What to build

Close the arcade session: the player can be hurt and killed under design combat rules, use bomb as a panic tool, and on final death land on Results with a real summary, Scrap grant, and local high-score write — then Quick retry into a clean Run.

Enemy projectiles (dart/gunner-level) feed the same player damage path as contact. Authored intro wave choreography and endless pattern playlists stay out of this ticket; existing threat spawn from ticket 01 may keep the field populated.

## Acceptance criteria

- [ ] Contact and enemy bullets damage the player; standard hit 1 HP (heavy 2 when marked); at most one player damage instance per sim step (highest wins) → shield → HP → life.
- [ ] I-frames after HP damage (1.0 s), respawn (2.0 s), and shield absorb (0.5 s); during i-frames player still moves and fires; no damage from enemy body/bullet.
- [ ] HP → 0 with lives remaining: lose a life, respawn at band center, mercy-clear enemy bullets within r = 3, enemies remain.
- [ ] Lives → 0: run terminal; shell transitions once to Results with score, wave, kills, time survived (pause excluded), ship kit, Scrap earned.
- [ ] Scrap formula applied at Results and persisted; qualifying runs write top-10 local high scores; Results UI shows real data (not scaffold empty state).
- [ ] Bomb is edge-triggered; spends stock when available (start/max per kit defaults); clears enemy bullets on playfield, deals 5 damage to on-screen enemies, grants 0.75 s i-frames, scores kills normally; empty stock is a no-op.
- [ ] Pause freezes sim (including combat and elapsed); focus loss auto-pauses on Run.
- [ ] Quick retry and Launch fully reset combat state; no continues mid-run.
- [ ] Sim-step tests cover damage ordering, i-frames, respawn, bomb, and run-over terminal; manual smoke: die → Results → Scrap/high score path → Quick retry.

## Blocked by

- `01-shoot-kill-score` (Shoot, kill, and score under fire)
