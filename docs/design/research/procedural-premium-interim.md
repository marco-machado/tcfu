# Research note: Premium procedural interim

Companion to ADR 0005 and `art-pipeline.md`. Captures the grilled plan for raising placeholder procedural assets without implementing Tripo/GLB yet.

## Relationship to long-term pipeline

| Horizon | Path |
|---------|------|
| **Now (this pass)** | Runtime procedural meshes + material tokens + light parallax |
| **Later** | GPT-image-2 concepts → Tripo GLB → `useGLTF`, per `art-pipeline.md` |

Registry seam (catalog id → view recipe) is the only structural prep for the later swap.

## Craft stack

Primary: **geometry + materials**. Secondary: tune existing light/fog/bloom tiers. Scenery stays subordinate to combat read.

## Scope map

| Layer | Approach | Notes |
|-------|----------|--------|
| Ship kits | Four **bespoke** builders | Shared Hangar + Run |
| Enemies | Class template + id accents | Merged geo, instanced per id |
| Projectiles / powerups | Lightweight shape kit | Instance-friendly |
| Corridor | 2–3 parallax layers | Stream-synced; Low may drop a layer |
| Materials | Named tokens only | No freeform Standard props; no required textures |

## Done bar (acceptance)

1. All four kits nameable from Hangar silhouette alone.
2. Enemy **class** readable at a glance; ids distinct enough (e.g. razor ≠ prism).
3. Team colors hold under Medium bloom (player cool/cyan, enemy warm, pickups gold-green).
4. Corridor has depth without fighting combat silhouettes.
5. Medium is the product look; Low keeps correct silhouettes with fewer optional parts.
6. No unrelated sim features; fairness-only hitbox/`PLAYER_HULL` retunes if needed.
7. View registry seam in place for future GLB entry replacement.

## Soft budgets (guidance)

Stay well under future GLB poly targets in `art-pipeline.md`. Prefer few dozen primitives / low hundreds of tris per kit; cheaper fodder; heavier colossus acceptable as a singleton.

## Non-goals

Tripo/GPT-image-2/GLB import, Draco/KTX2, texture authoring, custom hull shaders, DOF/SSR/hitstop, new catalog content, music direction, quality-model rewrite, dual procedural/GLB runtime flag.

## Invariants

- Sim authority; presentation events (ADR 0004).
- Mesh never combat authority.
- 60 fps intent at Medium.
- Design palette and readability rules from `DESIGN.md` §7 and `art-pipeline.md`.
