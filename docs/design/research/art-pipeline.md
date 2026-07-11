# Research: Art direction and hi-fi pipeline

Supporting note for `docs/design/DESIGN.md` § Presentation.  
Source ticket: `.scratch/spaceshooter-design/issues/10-art-direction-pipeline.md`.

## Question

How to specify high-fidelity sci-fi presentation for a web R3F endless vertical shmup (planar combat, small hitboxes).

## Art direction

| Pillar | Spec |
|--------|------|
| Tone | Dark void + luminous tech: cold metals, emissive thrusters, neon accent edges, readable faction colors |
| Materials | PBR (metal/rough/normal/emissive), cinematic grade |
| Scale | Hero player/elites detailed; fodder simpler, same language |
| Readability (hard) | Silhouette and team color beat detail. Player shots cool/cyan; enemy warm/amber-orange; pickups gold/green. If bloom washes bullets, reduce bloom |

## Lighting and post

- Key: cool directional + soft fill; Drei `<Environment>` IBL; optional light fog.
- Run post (`@react-three/postprocessing`): **Bloom** (high threshold, emissive-driven), light **Vignette**, SMAA/MSAA as available.
- **Off in Run:** DOF, heavy SSR/AO, strong chromatic aberration.
- Quality tiers: Low (no/low bloom, simpler env), Medium (target look), High (+ better shadows/env). **60 fps** intent at Medium on mid desktop.

## Authoring pipeline: Tripo + GPT-image-2

Primary production path for meshes and concept/albedo guidance:

| Stage | Tool | Output |
|-------|------|--------|
| Concept / orthos / material refs | **GPT-image-2** (or equiv image gen) | PNG refs, turnarounds, decal ideas |
| 3D mesh | **Tripo** (image-to-3D / text-to-3D as available) | **GLB** |
| In-engine | Drei `useGLTF` (+ Draco/Meshopt), optional KTX2 textures | Runtime assets |

### Engine import rules

- Format: **GLB** (glTF binary).
- Prefer Draco (and Meshopt when useful); textures KTX2/Basis when practical.
- Scale at import so gameplay units match sim (1 unit ≈ 1 m); hitbox is design data, not mesh bounds. Enemy hitbox shapes come from [`../catalogs/enemies.md`](../catalogs/enemies.md) (circles; colossus AABB 2.0×1.2); never derive them from generated mesh size.
- Name files by catalog id: `ship_vanguard.glb`, `enemy_drone.glb`, etc.
- Fodder: instance-friendly, single LOD; player/colossus: optional 2 LOD.
- Placeholders OK until Tripo finals land.

### Poly budgets (targets)

| Class | Tris |
|-------|------|
| Player | 15k–40k |
| Fodder | 1k–5k |
| Grunt | 5k–12k |
| Elite | 12k–25k |
| Set-piece | 30k–80k |
| Scenery chunk | 2k–10k |

## Generation prompts (use in production docs)

Copy/adapt these when generating. Always append the **global suffix**.

### Global suffix (every asset)

```
Style: high-fidelity sci-fi PBR game asset, clean readable silhouette, dark void background, cold brushed metal with subtle panel lines, emissive thruster and edge accents, not cartoon, not low-poly, not photoreal Earth scenery, game-ready proportions, centered subject, single object, no base/stand, no text, no watermark.
```

### GPT-image-2 — concept / turnaround

**Player ships** (replace `{NAME}` / role notes):

```
Orthographic turnaround sheet of a {NAME} space fighter for a vertical shmup, three views (front, side, top), {ROLE_BLURB}. Bright cyan engine glow, highly readable outline from above and behind. {UNIQUE_DETAILS}. White/neutral studio lighting plus separate emissive callouts.
```

| Ship | ROLE_BLURB | UNIQUE_DETAILS |
|------|------------|----------------|
| vanguard | balanced default hero interceptor | angular reliable fighter, medium wings |
| striker | glass-cannon gunship | long nose, aggressive fins, hotter orange-red thruster tint |
| aegis | armored defender | broad hull, shield emitter rings, heavier plating |
| phantom | mobility dart | slim low profile, stealthier dark metal, thin wings |

**Enemies:**

```
Game-ready concept of a {ENEMY_ID} hostile craft, warm amber-orange accent lights, hostile silhouette distinct from player cyan, {CLASS} size ({SIZE_HINT}), readable from top-down/chase camera, single subject.
```

| Id | CLASS | SIZE_HINT |
|----|-------|-----------|
| drone | fodder | small drone |
| dart | fodder | tiny fast wedge |
| gunner | grunt | medium turreted craft |
| sidecar | grunt | craft with side pods |
| razor | elite | large aggressive gun platform |
| prism | elite | geometric crystalline gunship |
| colossus | set-piece boss | huge capital fragment, wide silhouette |

**Bullets / VFX stills (optional refs):**

```
Simple glowing energy projectile, {COLOR}, soft core bright rim, transparent background, no ship, icon-like clarity for arcade readability.
```

- Player: `COLOR = cyan-blue`
- Enemy: `COLOR = amber-orange`
- Pickup: `COLOR = gold` / `lime green` for repair/shield as needed

### Tripo — mesh generation

Prefer: generate GPT-image-2 **hero orthographic or 3/4** image → Tripo **image-to-3D** → GLB.  
Fallback: Tripo text-to-3D with the prompts below.

**Text-to-3D template:**

```
{SUBJECT}. High-detail sci-fi PBR spaceship mesh for a real-time game, clean topology-friendly forms, closed manifold mesh, no ground plane, no character, thrusters and hard-surface panels, emissive engine channels, scale suitable for arcade fighter, single object GLB.
```

**Per ship SUBJECT one-liners:**

- `vanguard`: balanced angular space interceptor fighter
- `striker`: elongated aggressive gunship with twin forward cannons
- `aegis`: wide armored escort with shield ring emitters
- `phantom`: ultra-slim stealth dart interceptor

**Per enemy SUBJECT one-liners:** use table names above (e.g. `small hostile drone with amber-orange lights`).

**Tripo post checklist (before engine):**

1. Apply uniform scale to match design size class.
2. Origin at visual center (approx hitbox center).
3. +Y forward for player ships (game faces +Y); document any fixup transform in code.
4. Merge tiny materials where possible; keep emissive materials separate for bloom.
5. Export GLB; enable Draco on pipeline if Tripo export is raw.

## Scene and VFX

- Parallax scenery chunks + stream FX in view layer only.
- Particles/instancing for bullets and explosions; sim only emits events.
- Camera: fixed corridor + tiny cosmetic sway (spatial design).

## What DESIGN.md must contain

Tone, palette, readability rules, quality tiers, Tripo/GPT-image-2 pipeline pointer, post stack, budgets.  
Full file-by-file asset checklist can grow as an appendix; catalog ids are the source of truth for names.

## References

- Drei `useGLTF` (Draco / Meshopt), `Environment` preloading.
- `@react-three/postprocessing` bloom/vignette; selective bloom via emissive + threshold.
- Spatial/combat readability: planar play, hitbox vs silhouette.
