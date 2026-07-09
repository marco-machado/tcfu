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

**Scrap**:
Persistent meta currency earned at Results and spent only in the Upgrade bay.
_Avoid_: Coins, gold, currency (vague), W-cells (run-scoped)

**Meta upgrade**:
One rank on the persistent Scrap tree (Arsenal, Hull, Salvage, or Thrusters). Survives across Runs.
_Avoid_: Powerup, run upgrade, ship unlock (score milestones, not Scrap)

**Meta rank**:
Owned level 0–3 on one meta-upgrade branch; buying rank N requires owning N−1.
_Avoid_: Level, tier (reserved for weapon/run upgrades)

**Upgrade bay**:
Hangar surface where the player spends Scrap on meta upgrades.
_Avoid_: Shop, store, loadout screen

**Wave pattern**:
A hand-authored spawn choreography of enemies and hazards, reusable under a difficulty curve.
_Avoid_: Level, stage, procedural swarm (unless explicitly procedural)

**Playlist band**:
A wave-index range that selects wave patterns from a fixed pool (intro, early, mid, late).
_Avoid_: Stage, chapter, act

**Elite**:
Enemy class for tankier, denser-threat foes (for example razor and prism). Not a wave type.
_Avoid_: Boss (reserved for set-piece framing in UI copy only), mini-boss as a separate mode

**Set-piece**:
A wave highlight encounter featuring a set_piece-class threat (Colossus patterns), scheduled on fixed wave multiples.
_Avoid_: Boss level, stage, mission, campaign fight

**Boss bar**:
Run HUD hit-point readout shown while a set-piece enemy is active. Not a separate game mode.
_Avoid_: Boss stage UI, mission objective bar

**Endless survival**:
The sole mode: continuous escalating threat until death; no campaign stages as the primary structure.
_Avoid_: Story mode, mission select
