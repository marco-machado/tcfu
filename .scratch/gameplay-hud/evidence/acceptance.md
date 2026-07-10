# Survival-first HUD acceptance evidence

Captured at the desktop 4:3 product viewport (`1024 × 768`) through the rendered Run screen.

- Baseline: score 0, wave 1, kills 0, HP 3/3, lives 3, shield offline, bombs 2.
- Controlled state: score 9,876,543, wave 99, kills 888, HP 1/3, lives 2, shield ready, bombs 0.
- Stable geometry: wave, survival, and bomb module bounds were unchanged between baseline and controlled states; the fixed score module also remained anchored.
- Presentation events: `player_hit`, `shield_break`, and `life_loss` each activated their corresponding non-text survival-cluster reaction through the existing presentation buffer.
- Empty bombs: rendered `BOMBS 0 EMPTY` with disabled color and dashed geometry.
- Movement band: the persistent survival module began at `y=704`; the movement-band boundary ended at `y=701`.
- Console: 0 application errors. The only warnings were the pre-existing `THREE.Clock` deprecation documented in the PRD.

Screenshot: [`desktop-4x3.png`](desktop-4x3.png)
