# Catalog: Screens

Top-level screens controlled by `ScreenId`. The session starts on `title`; only one top-level screen renders at a time inside the shared `Stage`.

| id | name | role | primary content | entry points | exits |
|----|------|------|-----------------|--------------|-------|
| title | Title | Main menu | Full-name brand lockup, game premise, primary and secondary menu actions | App start; Hangar back; Results title | Hangar; High Scores; Settings |
| hangar | Hangar | Pre-run ship selection | Career best, Scrap, selected-ship preview and stats, ship unlocks | Title play; Results hangar; Run pause exit; Upgrade Bay back | Run; Upgrade Bay; Title |
| upgradeBay | Upgrade Bay | Persistent progression | Scrap balance and permanent Arsenal, Hull, Salvage, and Thrusters ranks | Hangar | Hangar |
| run | Run | Active gameplay | Three.js playfield, combat HUD, touch controls, pause and destroyed overlays | Hangar launch; Results quick retry; Run pause restart | Results after run end; Settings from pause; Hangar from pause |
| results | Debrief | Post-run summary | Final score, ship, wave, kills, best chain, grazes, time, career best, unlocks, and Scrap payout | Run end | Run quick retry; Hangar; High Scores; Title |
| highScores | High Scores | Local leaderboard | Rank, score, ship, wave, and survival time | Title; Results | Title |
| settings | Settings | Local configuration and data controls | Video quality, motion, audio, autofire, controls reference, and progress reset actions | Title; Run pause | Stored return screen (`title` or `run`) |

Title intentionally keeps the entry hierarchy compact and does not repeat control
instructions. Settings is the durable controls-reference surface for keyboard, pointer,
touch, and gamepad guidance.

## Flow

```text
Title ── Play ──> Hangar ── Launch ──> Run ── Run end ──> Results
  │                 │  ▲                  │                   │
  │                 │  └── Upgrade Bay ──┘                   ├── Quick retry ──> Run
  │                 └─────────────────────────────────────────┤
  ├── High Scores <───────────────────────────────────────────┤
  └── Settings                         Run pause ──> Settings ┘
```

## Overlays

These are states within `run`, not top-level `ScreenId` values.

| overlay | trigger | actions / behavior |
|---------|---------|--------------------|
| Paused | Pause input, pause button, or window blur | Resume; Settings; confirmed restart; confirmed exit to Hangar |
| Destroyed | Run over during the authored death hold | Displays salvage status, then advances automatically to Results |

## State and persistence

- `settings` returns to the screen stored in `settingsReturn`.
- Starting or restarting `run` clears the previous run summary and resets the simulation.
- Finishing a run records career best, unlocks newly eligible ships, awards Scrap, and updates local high scores before opening `results`.
- Settings, meta upgrades, selected ship, career best, and high scores persist locally; the active screen and current run do not.
