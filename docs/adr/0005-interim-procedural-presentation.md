# Interim procedural presentation before production GLB

Status: accepted
Date: 2026-07-10

Long-term art remains hi-fi PBR via **Tripo → GLB** and **GPT-image-2** concepts (`docs/design/research/art-pipeline.md`). For the next presentation craft pass we deliberately **do not** take that pipeline: we raise **runtime procedural** meshes, materials, and light parallax scenery to a premium interim bar so the full frame (kits, enemies, shots, pickups, corridor) stops reading as a tech demo.

**Why now:** production mesh authoring is deferred; arcade readability and kit identity still need to ship. **Why not skip to GLB:** scope and tooling cost. **Why not only juice/post:** Presentation v1 already landed events, bloom tiers, and SFX; remaining gap is silhouette and material craft.

**Shape of the interim:**

- View-only craft; sim stays combat authority (see ADR 0004). Mesh is never hitbox authority.
- **Four bespoke** procedural ship-kit builders; Hangar preview uses the **same** builders as Run (mini R3F).
- Enemies: **class templates + per-id accents**; bake one merged geometry per enemy id and **instance** at runtime (colossus may stay a single group).
- Projectiles/powerups: cheap distinct primitives (bolts/orbs/wedges), not hero meshes.
- Corridor: 2–3 stream-synced parallax layers; quality may drop a layer on Low.
- Shared **material tokens** (hull/thruster/accent/scenery); geometry + materials first; light/env tuned within existing quality tiers.
- Thin **registry** in view: catalog id → component/recipe so a later GLB pass replaces entries, not every call site.
- Quality **detail ladder**: Medium is the full interim look; Low strips optional parts; High is Medium plus cheap extras only.
- Hitbox / `PLAYER_HULL` changes only for clear fairness fails after visual scale is exhausted; small, catalog/constants, called out in PR.

**Rejected for this pass:** procedural-as-forever (no registry), dual procedural+GLB flags now, texture/uber-shader pipeline, prop-dense diorama corridor, freeform per-mesh materials, free combat retunes for “feel.”

Production GLB import remains a **later** pass; this ADR does not cancel `art-pipeline.md`.
