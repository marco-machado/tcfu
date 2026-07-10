# Premium procedural interim

Status: `resolved`

## Problem Statement

The game is fully playable and Presentation v1 already delivers combat juice, quality tiers, audio stubs, and rumble, but a Run still reads as a tech demo geometrically. Ship kits are stacked boxes with light tinting, enemies are scaled boxes, projectiles and powerups are plain spheres, and the corridor is a flat plane plus a grid of stream markers. Hangar kit preview is CSS silhouettes that do not match the Run mesh language. Players can finish sessions without the hi-fi sci-fi silhouette and material craft the design promises, while production Tripo/GLB authoring is intentionally deferred.

## Solution

Ship a **premium procedural interim** presentation pass: raise full-frame runtime procedural craft (ship kits, enemies, projectiles, powerups, light parallax corridor) with shared material tokens and a quality detail ladder, without implementing the production GLB pipeline. Four bespoke ship-kit builders feed both Hangar (mini R3F preview) and Run. Enemies use class templates with per-id accents, merged into instance-friendly geometry. A thin view registry maps catalog ids to recipes so a later GLB pass can replace entries. Sim stays combat authority; mesh never defines hitboxes. Fairness-only hitbox or player-hull retunes are allowed only after visual scale fails. Acceptance is readability and identity, not pixel-matching production art.

## User Stories

1. As a player in a Run, I want my ship kit to look like a crafted sci-fi fighter rather than stacked boxes, so that the fantasy matches the design tone.
2. As a Vanguard pilot, I want a distinct angular interceptor silhouette with bright cool thrusters, so that the baseline kit is immediately recognizable.
3. As a Striker pilot, I want a long-nose aggressive gunship silhouette with hotter thruster accents, so that the glass-cannon fantasy reads visually.
4. As an Aegis pilot, I want a broader armored hull with shield-emitter cues, so that the defender kit reads before combat starts.
5. As a Phantom pilot, I want a slim low-profile dart with stealthier dark metal still hi-fi readable, so that the mobility kit is not just a recolor.
6. As a player in Hangar, I want the selected kit preview to use the same procedural builder as the Run, so that Launch does not surprise me with a different shape.
7. As a player switching kits in Hangar, I want each unlocked kit’s 3D preview to update immediately, so that comparison is honest.
8. As a player, I want all four kits to be nameable from Hangar silhouette alone in a side-by-side sense, so that identity is not only stats text.
9. As a player, I want kit materials to use cold metal, panel-friendly roughness contrast, and emissive thruster or edge accents, so that craft feels premium without textures.
10. As a player fighting fodder, I want small hostile silhouettes that still read as threats, so that swarm density stays clear without hero-mesh cost.
11. As a player fighting grunts, I want medium craft shapes distinct from fodder, so that tankier presence is visible.
12. As a player fighting elites, I want denser, more aggressive silhouettes (razor vs prism still distinguishable), so that elite pressure is felt visually.
13. As a player facing a set-piece Colossus, I want a large capital-fragment silhouette, so that wave highlights dominate the frame briefly.
14. As a player, I want enemy class readable at a glance (fodder vs grunt vs elite vs set-piece), so that threat level does not depend on the HUD alone.
15. As a player, I want enemy accents warm (magenta-orange family), so that hostiles never read as friendly cyan.
16. As a player, I want my shots cool/cyan and elongated or bolt-like rather than anonymous peas, so that offense direction and team side stay clear.
17. As a player, I want enemy bullets warm and shape-distinct from mine, so that dodging remains arcade-readable under bloom.
18. As a player, I want powerups to have distinct simple primitives per type plus gold/green readability, so that pickups are guessable before collection.
19. As a player, I want the corridor to show 2–3 parallax layers synced to the world stream, so that the stage feels like hostile space rather than a desk plane.
20. As a player, I want scenery to stay subordinate to combat silhouettes, so that props never hide shots or ships.
21. As a player on Medium quality, I want the full intended procedural look, so that Medium remains the product target (~60 fps intent).
22. As a player on Low quality, I want fewer optional sub-meshes and scenery layers while keeping correct silhouettes and team colors, so that weaker desktops stay playable without a different game identity.
23. As a player on High quality, I want at most cheap extras over Medium (for example denser stream streaks or thruster glow), so that High is not a second art pass.
24. As a player changing quality in Settings, I want the detail ladder to apply without restarting the app, so that Settings stay responsive as today.
25. As a player, I want existing presentation events (hit flash, kill burst, bomb pulse, pickup spark, death burst) to still work on the new meshes, so that juice does not regress.
26. As a player, I want bloom to remain emissive-driven and high-threshold, so that shots do not wash out when thrusters glow.
27. As a player, I want movement band chrome and HUD to stay uncluttered, so that premium meshes do not bury score and resources.
28. As a player, I want hitboxes to stay catalog/sim data, so that a prettier mesh cannot cheat collision by itself.
29. As a player, I want visual hulls that may be larger than hurtboxes in the usual arcade way, so that fairness and readability both hold.
30. As a player, if a new silhouette makes combat feel clearly unfair after visual-scale fixes, I want only small documented hitbox or player-hull retunes, so that feel can be corrected without a balance rewrite.
31. As a developer, I want a thin view registry from catalog id to visual recipe, so that a later GLB pass replaces entries instead of every call site.
32. As a developer, I want material tokens (named hull/thruster/accent/scenery recipes) rather than freeform materials per mesh, so that the frame stays coherent and bloom-safe.
33. As a developer, I want enemy kinds baked to merged instance geometry per id, so that high enemy counts keep predictable draw cost.
34. As a developer, I want the player kit as a normal mesh group (not instanced), so that bespoke multi-part ships stay simple with one ship on screen.
35. As a developer, I want Colossus allowed as a singleton group if merge is awkward, so that set-piece craft is not blocked by instance rules.
36. As a developer, I want sim and presentation-event authority unchanged (ADR 0004), so that view craft cannot invent combat outcomes.
37. As a developer, I want no production GLB, Tripo, texture, or dual-path flag in this pass, so that scope stays interim procedural only.
38. As a designer, I want long-term art-pipeline docs to remain valid, so that this pass is explicitly interim rather than a silent cancel of Tripo/GLB.
39. As a player, I want Stream motion on scenery to follow world stream speed, so that the corridor sells endless survival motion.
40. As a player, I want kit thruster temperature and accent layout to differ by kit fantasy, so that color is not the only differentiator.
41. As a player on Low quality, I want post/DPR/particle gates from Presentation v1 preserved, so that the detail ladder layers on existing quality behavior rather than replacing it.
42. As a player, I want enemy and player scales to match existing sim size language, so that patterns and band play still feel familiar.
43. As a QA player, I want a clear manual checklist (identity, class read, team colors under Medium bloom, corridor depth, Low ladder), so that “done” is not subjective vibe alone.
44. As a developer, I want pure tests on the registry and material tokens, so that completeness and constraints are guarded without WebGL snapshot tests.
45. As a player launching from Hangar, I want Launch, Upgrade bay, and kit selection flows unchanged, so that shell UX does not regress while the preview upgrades.

## Implementation Decisions

### Scope and authority

- Feature name: premium procedural interim (ADR 0005; research note `procedural-premium-interim`).
- View-only craft unless a fairness-only hitbox or player-hull constant change is required after visual scale fails.
- Sim remains combat authority. Presentation events remain the juice path (ADR 0004). Mesh never combat authority.
- Production path (Tripo/GLB/GPT-image-2, Draco/KTX2, textures) stays later; do not implement dual procedural/GLB runtime flags.

### Visual registry (primary architectural seam)

- Introduce a thin **view-only registry**: ship kit id → kit visual component or build function; enemy kind → instance recipe (merged geometry + materials); projectile and powerup roles → instance recipes.
- Playfield and Hangar consume the registry by id; they do not hardcode one-off mesh graphs outside that map.
- Registry entries accept a **detail level** derived from quality (Low strips optional parts/layers; Medium full interim look; High ≈ Medium plus cheap extras only).
- Future GLB work replaces registry implementations, not every consumer.

### Ship kits

- Four **bespoke** procedural builders (vanguard, striker, aegis, phantom), not a single shared chassis with parameters.
- Hangar selected-kit preview mounts the **same** builder via a small R3F canvas (or equivalent mini scene), replacing CSS-only silhouettes for the hero preview.
- Player remains a normal object graph (one active ship + Hangar preview), not instanced.
- Kit fantasies follow catalog art tags: angular balanced interceptor; long-nose hotter thrusters; broad shield emitters; slim stealth dart.
- Hit flash and related presentation still drive material emissive or equivalent on the kit without granting combat authority to the mesh.

### Enemies

- **Class templates** (fodder, grunt, elite, set_piece) with **per-id accents** for drone, dart, gunner, sidecar, razor, prism, colossus.
- At module init (or equivalent build time), bake each enemy id into a **single merged geometry** suitable for one InstancedMesh per id (existing per-kind instance pools already partition by kind).
- Prefer one or two materials (body + emissive) via groups or multi-material mesh.
- Colossus may be a singleton non-instanced group if merge is painful.
- Warm hostile palette only.

### Projectiles and powerups

- Lightweight shape kit: player bolts/capsules; enemy orbs or wedges; powerups distinct primitives per type.
- Keep instancing and pool caps; no multi-mesh hero projectiles or per-weapon-tier silhouette sets.
- Team and pickup colors stay cyan/cool, warm, gold-green.

### Corridor and scenery

- Light parallax kit: 2–3 layers (far void/stars plate, mid tech ribs or pylons, near stream streaks), recycling with world stream speed.
- Scenery never participates in collision.
- Low quality may drop a layer; Medium carries the full interim corridor read.

### Materials and lighting

- Shared **material tokens** (named recipes for cold hull, hostile hull, player thruster, hot thruster, enemy accent, pickup gold/green, scenery metal, etc.). Builders only pick tokens plus optional constrained tints.
- No freeform ad-hoc Standard props scattered in builders; no custom hull uber-shader; no required albedo/normal textures this pass.
- Craft stack: geometry + materials first; tune existing ambient/directional/fog/bloom within current quality model; no DOF/SSR/new post stack.

### Quality detail ladder

- Medium = full interim procedural look (product target, 60 fps intent).
- Low = fewer optional sub-meshes / accents / scenery layers; silhouettes and team colors remain correct; existing Low post/DPR/particle gates remain.
- High = same meshes as Medium or only cheap extras (glow density, stream streak density); not a second art bar.

### Fairness-only combat adjacent edits

- Default: fix unfairness by **visual** scale relative to fixed hitboxes.
- If play shows clear fail (shots that clearly miss the hull still kill, or a kit looks huge with identical hurtbox in a way that confuses fairness), allow **small** hitbox radius or player-hull constant retunes in sim/catalog data, documented in the change description.
- Do not derive hitboxes from mesh bounds automatically. Do not free-tune radii for vague “feel.”

### Soft craft budgets (guidance, not hard gate)

- Stay well under future GLB poly budgets in art-pipeline research.
- Prefer few dozen primitives / low hundreds of tris per kit; cheaper fodder; heavier colossus OK as singleton.

### Modules (conceptual)

- View: registry, material tokens, kit builders, enemy bake/instance recipes, projectile/powerup recipes, parallax corridor, Playfield wiring, quality detail plumbing.
- Shell: Hangar preview host using shared kit builders; preserve selection, Launch, Upgrade bay, career best, Scrap display behavior.
- Sim/catalog: only if fairness-only constant/catalog hitbox or hull edits are required.
- Do not expand sim combat rules, wave content, or presentation-event schema unless a flash integration bug forces a minimal fix.

## Testing Decisions

### What good tests look like

- Assert **external behavior** of pure view modules: registry completeness for all ship kit ids and enemy kinds; material tokens expose required fields and stay within bloom-safe emissive ranges if such constraints are encoded; detail ladder returns fewer optional parts on Low than Medium for a given kit or scenery recipe.
- Do **not** assert triangle counts, exact vertex positions, React Three Fiber mount trees, or pixel snapshots.
- Do **not** invent WebGL render tests for this pass (no prior art in the repo; brittle).
- Sim remains tested at the existing world-step seam only when fairness-only constants change (hitbox radii, player hull): reuse patterns from current sim step tests.

### Primary automated seam

- **Visual registry + material tokens** (pure TypeScript, no canvas).
  - Every ship kit id resolves to a recipe/builder.
  - Every enemy kind resolves to an instance recipe with geometry and materials.
  - Projectile and powerup roles used by the playfield resolve.
  - Token names used by builders exist.
  - Detail level Low omits optional layers that Medium includes (if the API exposes optional part lists or flags).

### Secondary automated seam

- Existing **sim step tests** only if hitbox or player-hull numbers change; extend or adjust assertions for band/hull behavior already covered.

### Manual smoke (acceptance bar)

1. All four kits nameable from Hangar silhouette.
2. Enemy class readable; razor vs prism distinguishable.
3. Team colors hold under Medium bloom.
4. Corridor shows multi-layer depth without drowning combat.
5. Medium is the product look; Low keeps silhouettes with reduced optional detail.
6. Presentation juice still fires on hit/kill/bomb/pickup/death.
7. Hangar Launch and kit selection still work; Run uses the same kit identity as Hangar.

### Prior art

- Pure unit tests under the sim tree (vitest, `src/**/*.test.ts`) are the only automated pattern today.
- Presentation v1 relied on pure tests for event buffer/gain mapping and manual smoke for visuals; this pass mirrors that split for registry purity vs visual craft.

## Out of Scope

- Tripo, GPT-image-2, GLB import, Draco, Meshopt packaging, KTX2/Basis textures, `useGLTF` production path.
- Dual procedural/GLB feature flag or empty model pack scaffolding beyond the registry seam.
- Custom hull uber-shaders, texture authoring, normal maps as a requirement.
- DOF, SSR, heavy AO, hitstop, cinematic camera, aim kick, player-lag camera follow.
- New ships, enemies, weapons, wave patterns, meta upgrades, or combat rule changes unrelated to fairness-only radius/hull tweaks.
- Full music direction or new SFX set (existing stubs stay).
- Mobile/touch, multiplayer, cloud saves.
- Rewriting the quality tier model or Settings schema.
- Prop-dense diorama corridor or environment storytelling beyond the light parallax kit.
- Automated visual regression / screenshot pipelines.

## Further Notes

- Design long-term art remains hi-fi PBR via Tripo/GLB (`docs/design/research/art-pipeline.md`). This PRD is the interim craft standard (ADR 0005, `docs/design/research/procedural-premium-interim.md`). `DESIGN.md` §7 Art already points at both horizons.
- Domain language: ship kit, movement band, world stream, presentation event, endless survival, Hangar, Run, quality Low/Medium/High. Avoid calling kits “loadouts” or “skins.”
- Soft poly budgets guide craft; the finish line is the readability/identity checklist, not quotas alone.
- Prefer extending existing per-enemy-kind instance pools and presentation flash hooks rather than inventing parallel combat or VFX authorities.
- When implementing, keep material language consistent across bespoke kit graphs so four one-off builders do not become four unrelated art styles.
