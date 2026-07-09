# Spaceshooter

Desktop 4:3 vertical-scrolling arcade space shooter in full 3D (React Three Fiber). Single-player endless survival.

## Language

**Run**:
One continuous play session from launch into the playfield until the player dies and results are shown.
_Avoid_: Match, level, game (ambiguous)

**Movement band**:
The limited region of the playfield where the ship may translate (strafe and forward/back). Not the full endless volume.
_Avoid_: Arena, map bounds (too vague)

**World stream**:
Game-driven motion of threats and scenery toward the player along the corridor axis. Distinct from player thrust inside the movement band.
_Avoid_: Scroll speed controlled by the player, level conveyor (unclear)

**Ship kit**:
A selectable ship identity between runs: base stats plus starting weapon identity.
_Avoid_: Loadout (implies free mix-and-match), class ( overloaded)

**Powerup**:
A mid-run pickup that grants a temporary or run-scoped effect.
_Avoid_: Upgrade (reserved for run upgrade and meta upgrade)

**Run upgrade**:
An in-run tier improvement to the current ship or weapon that resets when the run ends.
_Avoid_: Level-up (RPG), permanent unlock

**Meta upgrade**:
A persistent progression node that survives across runs (including the meta-upgrade tree and ship unlocks by score milestones).
_Avoid_: Powerup, run upgrade

**Wave pattern**:
A hand-authored spawn choreography of enemies and hazards, reusable under a difficulty curve.
_Avoid_: Level, stage, procedural swarm (unless explicitly procedural)

**Endless survival**:
The sole mode: continuous escalating threat until death; no campaign stages as the primary structure.
_Avoid_: Story mode, mission select
