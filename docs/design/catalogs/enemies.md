# Catalog: Enemies

Base stats before wave difficulty multipliers. Class drives W-cells and drop tables.

| id | name | class | hp | points | hitbox | heavy_contact | shot | path_hint | w_cells |
|----|------|-------|-----|--------|--------|---------------|------|-----------|---------|
| drone | Drone | fodder | 1 | 100 | circle 0.40 | no | none or rare single down | drift_down | 1 |
| dart | Dart | fodder | 1 | 120 | circle 0.35 | no | single down on interval | dive / sine_x / cross_left / cross_right | 1 |
| gunner | Gunner | grunt | 4 | 300 | circle 0.55 | no | 3-way down slow | hold_and_shot | 2 |
| sidecar | Sidecar | grunt | 5 | 350 | circle 0.55 | no | side shots while drifting or crossing | drift_down / cross_left / cross_right | 2 |
| razor | Razor | elite | 20 | 1200 | circle 0.70 | no | aimed burst (at player at fire) | hold_and_shot / orbit_hold_left / orbit_hold_right | 5 |
| prism | Prism | elite | 28 | 1500 | circle 0.70 | no | 8-bullet ring; alternating volleys rotate by 22.5° | hold_and_shot / orbit_hold_left / orbit_hold_right | 5 |
| colossus | Colossus | set_piece | 100 | 5000 | aabb 2.0×1.2 | optional yes (2 dmg) | alternating 5-way closed / 4-way center-gap spray → pause → spray | hold (set-piece) | 15 |

## Classes

| class | Role |
|-------|------|
| fodder | Die to one basic shot |
| grunt | A few shots |
| elite | Dense patterns / tankier |
| set_piece | Wave highlight |

## Defaults

- No HP regen unless a future flag says so.
- Enemy bullet radius default **0.15**.
- Contact with player damages player; does not destroy enemy (no ram-kill).
