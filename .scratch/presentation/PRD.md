# Presentation v1

Status: `resolved`

## Problem Statement

The game is fully playable — combat, content, meta, and ship kits work — but a Run still feels like a tech demo. Placeholders have almost no juice: no hit/kill/bomb/pickup feedback, no camera life, audio sliders do nothing, rumble is absent, and shell screens are sparse. Players can finish sessions without the arcade feedback loop that makes readability and reward land.

## Solution

Ship **Presentation v1**: combat-driven **presentation events** feed lightweight view VFX, audio SFX stubs, and gamepad rumble; add tiny camera sway and quality-honest post/particle gates; polish Title and Hangar preview without blocking on production GLBs or full music direction. Sim remains authority; view/audio/rumble only consume events.

## User Stories

1. As a player, I want a brief flash when I take HP damage, so that hits read instantly.
2. As a player, I want a distinct cool flash when my shield absorbs a hit, so that shield break feels different from HP loss.
3. As a player, I want a small warm burst when an enemy dies, so that kills feel rewarding.
4. As a player, I want a clear pulse when I bomb, so that panic tools feel powerful.
5. As a player, I want a gold/green spark when I collect a powerup, so that pickups feel caught.
6. As a player, I want the existing death burst to still play on final death, so that Run end stays dramatic.
7. As a player, I want optional brief enemy hit flash on Medium/High, so that damage feedback is visible without requiring Low-tier cost.
8. As a player, I want tiny camera sway during a Run, so that the corridor feels alive without cheating aim.
9. As a player, I want no camera kick on hit and no player-lag follow, so that control stays honest.
10. As a player, I want player shots cool/cyan, enemies warm, and pickups gold-green, so that team readability stays arcade-clear.
11. As a player on Low quality, I want bloom off, lower DPR, and fewer or no optional particles, so that the game stays smooth.
12. As a player on Medium quality, I want the target look (bloom, vignette, normal particles, sway), so that mid desktops hit the intended feel at ~60 fps intent.
13. As a player on High quality, I want denser particles and higher DPR, so that capable machines look fuller.
14. As a player, I want quality changes to apply without restarting the app, so that Settings feel responsive.
15. As a player, I want SFX for hit, kill, bomb, and pickup, so that combat has sound feedback.
16. As a player, I want UI confirm SFX on key shell actions (at least Launch and Upgrade bay buy), so that menus acknowledge input.
17. As a player, I want master and SFX sliders to scale those sounds, so that volume settings matter.
18. As a player, I want the music slider to exist without requiring a full soundtrack, so that future music has a channel (default may stay silent).
19. As a player with SFX at 0, I want no audible combat noise, so that mute works.
20. As a player, I want audio to start reliably after first gesture if the browser requires it, so that SFX are not permanently silent.
21. As a player with a vibrating gamepad, I want short rumble on damage, life loss, and bomb, so that feedback reaches the hands.
22. As a player without rumble hardware, I want the game to ignore rumble cleanly, so that nothing errors.
23. As a player, I want Title to feel like a product entry (title, short tagline, clear Play), so that first boot is not a bare menu.
24. As a player in Hangar, I want a selected-kit preview using kit colors/silhouette, so that identity is visible before Launch.
25. As a player, I want Results, Upgrade bay, and Settings to stay information-correct with light visual consistency, so that polish is coherent without a redesign.
26. As a player, I want the Run HUD to stay uncluttered, so that juice does not bury score and resources.
27. As a developer, I want presentation events emitted from authoritative combat sites, so that VFX cannot lie about outcomes.
28. As a developer, I want a bounded event buffer drained each frame, so that spikes cannot grow forever.
29. As a developer, I want view code free of combat authority, so that the sim/view split stays clean.
30. As a player, I want Presentation v1 without waiting for Tripo GLBs, so that juice ships before production art.

## Implementation Decisions

### Scope

- Presentation v1: event-driven VFX, camera sway, quality-gated post/particles, audio SFX stubs, rumble stubs, Title/Hangar shell polish.
- No production GLB pipeline, no full music direction, no DOF/SSR/hitstop/cinematic camera, no gameplay/content changes.

### Architecture (ADR 0004)

- Preserve sim / view / shell. Sim owns combat; view/audio/rumble consume **presentation events**.
- Emit events at authoritative sites: player HP damage, shield absorb, enemy kill, bomb fire, powerup collect, final death (and optional enemy non-lethal hit on Medium+ if cheap).
- Bounded ring buffer (fixed capacity, drop oldest on overflow). View drains each display frame; audio and rumble may drain or share the same drain pass once per frame.
- Never invent combat from mesh overlaps or React state. Never `setState` in `useFrame` for motion; mutate particle pools/refs/instanced meshes only.

### Visual juice

| Event | Response |
|-------|----------|
| HP damage | Short player flash (cool/white) |
| Shield absorb | Distinct cyan flash |
| Kill | Warm burst at position; small particle count |
| Bomb | Band-readable pulse / radial flash |
| Pickup | Gold-green spark at collect point |
| Death | Keep/enhance existing death burst |

- Enemy non-lethal hit pulse: optional, reduced/off on Low.
- Palette locked: player cyan/cool, enemy warm, pickups gold-green.
- Bloom remains high-threshold / emissive-driven; if bullets wash out, tune intensity before redesigning materials.
- Mesh never authoritative for hitboxes.

### Camera and scene

- Fixed corridor camera retained; add tiny cosmetic sway (slow sine on position/rotation, small amplitude).
- Sway off or negligible on Low; on for Medium/High.
- No hit-impact kick, no aim offset, no player-lag follow.
- Background: void + existing stream markers; optional extra dim parallax placeholder layer if cheap.
- Optional light fog / Environment IBL only on Medium+ and only if fps-safe; cut IBL before cutting combat if Medium misses 60 fps intent.

### Quality tiers

| Tier | DPR | AA | Bloom/vignette | Particles | Sway | IBL/fog |
|------|-----|----|----------------|-----------|------|---------|
| Low | ~0.85 | off | off | minimal/off for optional | off/tiny | off |
| Medium | 1 | on | on | normal | on | optional light |
| High | ~1.5 | on | on | denser | on | preferred if cheap |

- Apply quality changes without app restart.
- 60 fps intent at Medium on mid desktop.

### Audio

- Small audio bus: gains from master × (sfx or music) using settings 0–100 → 0–1.
- SFX stubs (procedural Web Audio or short bundled one-shots): player hit, kill, bomb, pickup, UI confirm (minimum: Launch, Upgrade bay buy, plus combat set above).
- Music channel may be silent; default music volume may remain 0.
- When sfx gain is 0, skip playback work.
- Unlock AudioContext on first user gesture if required (Title Play / Hangar Launch).
- Optional: pause/mute when document hidden.

### Rumble

- When a gamepad vibration actuator exists: HP damage ~100 ms weak; life loss ~200 ms; bomb ~150 ms.
- No-op without hardware; no crash.
- No new rumble Settings toggle in v1.

### Shell polish

- Title: product hierarchy — title, short tagline, primary Play, secondary High Scores / Settings.
- Hangar: selected-kit preview panel (name + large silhouette/color block from kit identity); no separate hangar 3D scene required.
- Results / Upgrade bay / Settings: light visual consistency only; no IA redesign.
- HUD: no new clutter beyond existing boss bar / timers.

### Art pipeline

- Do not require Tripo GLBs for this PRD.
- Keep art-pipeline docs as future source of truth; defer runtime GLB loader to a later effort.

### Modules to deepen

- Presentation event buffer + emit sites in combat step path.
- View VFX pools + camera sway + quality gates.
- Audio bus + SFX stubs + settings gain.
- Rumble helper.
- Title and Hangar shell polish.
- Tests for event buffer and gain mapping.

## Testing Decisions

### What makes a good test

- Assert external behavior of pure modules: events enqueued at combat outcomes, buffer capacity/drop-oldest, gain mapping from settings integers, event types present after a stepped combat sequence.
- Do not assert WebGL frames, pixel colors, real AudioContext output, or gamepad hardware in CI.
- Do not couple combat correctness tests to particle counts.

### Seams

1. **Presentation event buffer (primary pure seam):** push/drain, capacity, event types after controlled `stepWorld` sequences (damage, kill, bomb, pickup, shield, death) if emission is sim-side.
2. **Audio gain mapping (pure):** settings → linear gains; zero sfx short-circuits.
3. View particles, rumble, shell look: **manual smoke** (Low vs High, mute SFX, bomb juice, kill pop, Hangar preview).

### Coverage expectations

- Buffer does not grow unbounded; overflow drops oldest.
- Kill/bomb/pickup/hit/shield/death produce the expected event kinds when those outcomes occur under test setup.
- Gain(0)=0; gain(100)=1; master multiplies channel.
- Prior art: sim step tests for combat outcomes; settings persist already exists.

## Out of Scope

- Production GLB authoring, Draco pipelines, LOD sets, texture baking
- Full music direction, adaptive score, voice
- DOF, SSR, heavy AO, strong chromatic aberration
- Hitstop, cinematic cameras, aim shake, player-lag follow
- Mobile / non-4:3 redesign
- New enemies, waves, meta, weapons, or balance changes
- Colorblind modes, full input rebinding, rumble settings UI
- Runtime GLB loader scaffold (deferred)

## Further Notes

- Domain: keep **Run**, **ship kit**, **powerup**, **set-piece**, **boss bar**. New term: **presentation event**.
- Binding palette and post rules: DESIGN § Presentation and `docs/design/research/art-pipeline.md`. Architecture: R3F research + ADR 0004.
- Success criterion: a human feels hits, kills, bombs, and pickups with VFX + SFX; sway on Medium; Low is lighter; Hangar shows a kit preview; Settings volumes work; no production art required.
- Confirmed seams: presentation event buffer + pure gain mapping; shell/view/audio hardware manual smoke.
