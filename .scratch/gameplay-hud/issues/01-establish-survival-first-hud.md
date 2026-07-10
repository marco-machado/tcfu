# Establish the survival-first HUD

Status: `resolved`

Blocked by: None

## Parent

[Gameplay HUD readability pass](../PRD.md)

## What to build

Replace the Run HUD's flat telemetry with a restrained arcade composition whose survival status is recognizable first. Give HP, lives, and shield a stable authored cluster; keep score and wave prominent; retain kills and bombs without letting them compete with survival; and ensure changing values do not shift neighboring information. Preserve the clear movement band and read all values from existing authoritative Run state.

This is a complete first tracer bullet: a player can launch a Run, take damage, gain or lose shield protection, spend all bombs, and see each state represented clearly in the redesigned HUD at the desktop 4:3 product viewport.

## Acceptance criteria

- [x] HP is the most visually prominent persistent survival value during a Run.
- [x] Lives are grouped with HP but remain subordinate to immediate health.
- [x] Shield presence and shield absorption are visually distinct from HP and HP damage.
- [x] Damage and shield changes use at least one non-text cue in addition to their label or value.
- [x] Score and wave remain prominent; kills remain available as secondary performance information.
- [x] Bomb availability is a compact actionable resource with an unmistakable empty state.
- [x] Dynamic score, wave, kill, HP, life, and bomb values use stable slots and do not reposition neighboring clusters.
- [x] Semantic colors consistently distinguish survival, shield, danger, objective, and disabled states without making color the only cue.
- [x] Persistent HUD geometry stays outside the movement band and likely threat lanes at desktop 4:3.
- [x] The HUD reads existing Run state and does not recreate combat, scoring, shield, or bomb rules.
- [x] Browser-level checks cover baseline, damaged, shielded, shield-absorb, life-change, and zero-bomb states through the rendered Run screen.
- [x] Desktop gameplay screenshots and a clean browser-console check are captured as acceptance evidence.

## Comments
