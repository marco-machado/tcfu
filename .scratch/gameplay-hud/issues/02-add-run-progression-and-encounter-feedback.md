# Add Run progression and encounter feedback

Status: `ready-for-agent`

Blocked by: 01

## Parent

[Gameplay HUD readability pass](../PRD.md)

## What to build

Extend the survival-first HUD with secondary Run progression and immediate encounter feedback. Show W-cell progress toward the next run upgrade, current weapon tier, maximum-tier state, estimated Scrap, timed powerups, and set-piece health as individually scannable elements rather than one telemetry sentence. Keep each element stable as values change and preserve the hierarchy established by the survival cluster.

A completed slice is demoable in a Run with multiple active powerups and a set-piece enemy: the player can distinguish temporary effects, impending expiration, weapon progress, secondary Scrap economy, and the boss bar without losing sight of survival or the movement band.

## Acceptance criteria

- [ ] W-cell progress toward the next run upgrade is shown as a stable progress treatment rather than embedded prose.
- [ ] Current weapon tier and maximum-tier state remain visually stable as progression changes.
- [ ] Reaching a new weapon tier produces a brief restrained reward response without obscuring play.
- [ ] Estimated Scrap remains readable but is visually subordinate to survival and Run progress.
- [ ] Each active timed powerup has an individually recognizable label or icon and remaining duration.
- [ ] Multiple timed powerups remain individually scannable and do not collapse into a joined sentence.
- [ ] Powerups approaching expiration use a restrained warning state with meaning beyond color alone.
- [ ] The boss bar uses a stable label and track while set-piece HP changes.
- [ ] The boss bar does not obscure threats or stack with another large banner over the play path.
- [ ] Large Scrap, W-cell, tier, timer, set-piece HP, score, and wave values do not shift critical HUD clusters.
- [ ] Progression and encounter UI reads existing authoritative Run state and existing presentation signals without duplicating progression or combat rules.
- [ ] Browser-level checks cover multiple powerups, expiration, large values, tier advancement, maximum tier, and a live set-piece state.
- [ ] Gameplay and set-piece screenshots plus a clean browser-console check are captured as acceptance evidence.

## Blocked by

- [01 — Establish the survival-first HUD](01-establish-survival-first-hud.md)

## Comments

