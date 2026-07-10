# Deep-space look target

Status: `resolved`

## Problem Statement

The player wants Runs to feel like the Corridor Signal key-art energy: a hi-fi interceptor under pressure in hostile space, cold cyan thrust against warm fire, deep void, and readable speed. After an audit of the live procedural presentation, the frame still reads as a flat vertical shmup with studio product lighting and short thruster nubs. The key art also shows a colossal trench corridor, but that architectural “corridor shaft” read is **not** desired for the game world. Threat colors should stay on the current warm amber/orange/red system, not retune to key-art magenta. Without a locked presentation bar, agents will either over-build trench walls, retune threat palette, or polish kits without selling deep-space depth and thruster motion.

## Solution

Lock and implement a **deep-space look target** for Run (and Hangar kit preview consistency): use the key art as a **partial** directional reference for craft silhouette energy, void contrast, player cyan, and motion—not as a mandate to rebuild corridor walls or magenta fire. Presentation-only work raises ship presence (especially thruster plumes), deep-space scenery (stars, sparse distant structure, stream-synced parallax without trench cages), projectile readability under the existing warm threat palette, and lighting/camera framing that sells depth and speed without changing sim authority, movement band rules, or combat colors for team identity beyond keeping threat warm as today. Update visual identity docs so “corridor” remains brand language for the movement band / stream fantasy, not a requirement for mega-wall architecture on the playfield.

## User Stories

1. As a player in a Run, I want the playfield to feel like deep hostile space rather than a desk plane or industrial trench, so that endless survival matches the promised sci-fi fantasy.
2. As a player, I want tall corridor walls and shaft architecture to stay out of the world read, so that the game does not chase a look I explicitly rejected.
3. As a player, I want the movement band to remain a gameplay constraint without reading as physical corridor walls, so that chrome does not fake architecture.
4. As a player, I want void blacks and distant starfield depth, so that the ship feels small against infinite space.
5. As a player, I want sparse distant structures or silhouettes at most, so that scale comes from space emptiness rather than wall cages.
6. As a player, I want world-stream-synced parallax that sells forward pressure, so that motion feels relentless without trench rails.
7. As a player, I want scenery to stay subordinate to combat silhouettes, so that props never hide shots or ships.
8. As a pilot, I want my ship kit to read as a crafted hard-surface interceptor, so that silhouette craft matches the key-art energy.
9. As a Vanguard pilot, I want the hero kit to feel closest to the key-art interceptor silhouette, so that the default ship carries the product look.
10. As a Striker, Aegis, or Phantom pilot, I want kit fantasies preserved while sharing the same material and thruster language, so that identity stays distinct without four unrelated art styles.
11. As a player, I want visible cyan thruster plumes or trails, so that speed and player energy match the key-art rear energy without needing a full rear-chase camera rewrite.
12. As a player, I want thruster glow to remain bloom-safe and cool/cyan, so that engines never read as enemy fire.
13. As a player, I want my projectiles cool/cyan and elongated enough to read as bolts, so that offense direction stays clear under bloom.
14. As a player, I want enemy projectiles warm amber/orange/red and shape-distinct from mine, so that dodging stays arcade-readable.
15. As a player, I want threat hull and fire colors to stay on the current warm system (not magenta-retuned), so that existing team color language is preserved.
16. As a player, I want enemy silhouettes to remain class-readable (fodder, grunt, elite, set-piece), so that threat level does not depend on HUD alone.
17. As a player, I want lighting that prefers deep void contrast over flat studio fill, so that emissive signals stay meaningful.
18. As a player, I want restrained bloom that still lets thrusters and shots punch, so that the frame stays cinematic without mushy neon soup.
19. As a player, I want camera framing that supports depth and speed cues without forcing a trench vanishing-point camera or sim coordinate rewrite, so that feel improves without combat re-architecture.
20. As a player on Medium quality, I want the full intended deep-space look, so that Medium remains the product target.
21. As a player on Low quality, I want fewer optional scenery layers and thruster extras while keeping silhouettes and team colors correct, so that weaker desktops stay playable.
22. As a player on High quality, I want only cheap extras over Medium (plume density, star density), so that High is not a second art bar.
23. As a player changing quality in Settings, I want the detail ladder to apply without restarting the app, so that Settings stay responsive.
24. As a player, I want existing presentation events (hit flash, kill burst, bomb pulse, pickup spark, death burst) to still work, so that juice does not regress.
25. As a player, I want Hangar kit preview to use the same ship builders and thruster language as Run, so that Launch is not a surprise.
26. As a player, I want hitboxes and sim combat to stay authoritative, so that prettier thrusters or hulls cannot cheat collision.
27. As a player, I want no fairness-driven combat retunes unless a visual scale fail is proven, so that this pass stays presentation-first.
28. As a designer, I want visual identity docs to state deep space (not trench walls) and keep threat colors warm, so that future agents do not rebuild the rejected corridor architecture or magenta fire lane.
29. As a designer, I want the key-art image kept as a partial directional reference (craft, void, cyan, motion), so that marketing still has a north star without over-constraining world architecture.
30. As a developer, I want material tokens to remain the only freeform-avoidance path for colors and emissives, so that builders do not invent ad-hoc materials.
31. As a developer, I want the view registry to remain the catalog-id seam for kits, enemies, projectiles, and powerups, so that later GLB work still swaps entries not every consumer.
32. As a developer, I want thruster plumes implemented as view-only presentation (mesh/VFX driven by ship pose and quality), so that sim does not gain thruster entities.
33. As a developer, I want scenery parallax to keep recycling against world stream speed, so that deep-space motion stays tied to endless survival.
34. As a developer, I want ADR 0004 presentation events unchanged unless a flash integration bug forces a minimal fix, so that juice authority stays clear.
35. As a developer, I want ADR 0005 interim procedural constraints respected (no GLB pipeline, no dual path flag), so that this pass is a look refinement not a pipeline pivot.
36. As a QA player, I want a clear manual checklist (deep space not trench, warm threat, cyan thrusters, silhouette identity, Low ladder, juice intact), so that done is not subjective vibe alone.
37. As a player, I want powerup readability (gold/green/cyan semantics) preserved, so that pickups stay guessable.
38. As a player, I want the Run HUD and shell chrome unchanged in role, so that presentation polish does not bury survival info.
39. As a player, I want fog or void falloff to support depth without hiding bullets in the movement band, so that fairness of read stays arcade-first.
40. As a player launching consecutive Runs, I want the deep-space look stable across wave pressure, so that later waves do not suddenly introduce trench architecture.
41. As a content designer, I want “Corridor Signal” brand language to still mean hold the band / ride the stream, so that naming does not require physical corridor walls in-world.
42. As a developer, I want pure tests to guard team-color token roles and registry completeness, so that threat-warm and player-cool cannot silently flip.
43. As a player on Low quality with bloom off, I want silhouettes and team colors still correct, so that the look target degrades by density not identity.
44. As a maintainer, I want this PRD to supersede any audit recommendation to build colossal walls or retune threat to magenta, so that rejected refinements stay rejected.

## Implementation Decisions

### Scope and authority

- Feature name: deep-space look target (presentation refinement after key-art audit + user refinements).
- View-only craft by default. Sim remains combat authority. Mesh and VFX never define hitboxes.
- Presentation events remain the juice path (ADR 0004).
- Interim procedural path remains (ADR 0005); no production GLB/Tripo pipeline in this pass.
- Explicit **non-goals locked by product**: colossal corridor trench architecture; threat palette retune to key-art magenta.

### Product look contract (from conversation)

- **Key art role:** partial directional reference for interceptor energy, deep void, player cyan, motion and contrast—not a layout master for walls or fire color.
- **World language:** deep-space stream. Sparse far structure allowed; continuous trench walls, floor panel shafts, and cyan wall cages are out.
- **Movement band:** gameplay bound only; band chrome must not become physical corridor walls.
- **Player signal:** cool cyan / vector blue for thrusters and player projectiles.
- **Threat signal:** keep current warm amber/orange/red material tokens and enemy fire language as implemented today (no magenta fire-lane retune).
- **Craft:** hard-surface hi-fi procedural kits; Vanguard remains the silhouette north star closest to key art.
- **Motion cues:** thruster plumes/trails and elongated readable bolts preferred over architectural leading lines.

### Primary architectural seam

- Reuse the existing **view registry + material tokens + quality detail ladder** as the single presentation seam.
- No new sim seams. No new combat entity types for thrusters or scenery.
- Prefer extending scenery parallax, kit thruster presentation, projectile instance recipes, and canvas lighting/fog/bloom tuning within the current quality model.

### Ship kits and thrusters

- Keep four bespoke kit builders; raise presence where cheap (panels, nozzle read, thruster mass).
- Add or strengthen **view-only thruster plumes/trails** (cyan/cool) driven by the live player mesh pose; quality may reduce plume complexity on Low.
- Hangar preview must share the same builders and thruster language as Run.
- Hit flash and presentation flashes continue to mutate materials without combat authority.

### Scenery / deep space

- Reframe parallax layers as **deep space**: far void/stars, optional sparse distant silhouettes, near stream streaks or light debris—not mid-side pylon walls that read as a shaft.
- Stream-sync recycling against world stream speed remains.
- Low may drop a layer; Medium carries the product deep-space read; High may only add density.

### Projectiles and enemies

- Player bolts: cool, elongated enough for direction read.
- Enemy bullets: warm, shape-distinct; **colors stay on current threat tokens**.
- Enemy geometry remains class templates + accents; no hero enemy meshes required for this pass.
- Do not introduce a dense “magenta fire lane” aesthetic as a requirement.

### Camera and lighting

- Allow modest camera/lighting/fog/bloom retunes that improve void depth and speed cues.
- Do **not** require a full rear-chase trench camera or coordinate-system rewrite of the XY movement band.
- Prefer less flat studio wash if it improves void blacks while keeping metal readable; stay inside existing post stack (no DOF/SSR requirement).

### Docs

- Update visual identity / art direction notes so:
  - deep space (not trench walls) is explicit;
  - key art is partial reference;
  - threat colors remain warm semantic roles already in the palette (amber/orange family in runtime tokens; magenta reserved for critical UI if already specified—do not force in-world fire to magenta).
- Keep brand name Corridor Signal and movement-band metaphors; clarify brand “corridor” ≠ mandatory mega-wall scenery.

### Fairness

- Default: fix unfairness by visual scale only.
- Fairness-only hitbox or player-hull constant edits only after proven visual-scale fail; document if used.
- No free combat retunes for “feel.”

### Modules (conceptual)

- View: material tokens, registry recipes, kit thruster presentation, projectile recipes, deep-space parallax scenery, playfield band chrome restraint, canvas lighting/fog/bloom.
- Shell: Hangar preview consistency only; no Upgrade bay / Results redesign.
- Design docs: visual identity look contract.
- Sim/catalog: only if fairness-only constants are required (default none).

## Testing Decisions

### What good tests look like

- Assert **external behavior** of pure view modules: registry completeness; material token roles for player-cool vs threat-warm preserved; detail ladder drops optional scenery/thruster extras on Low when the API exposes those flags.
- Do **not** assert triangle counts, exact plume mesh graphs, R3F trees, or pixel snapshots.
- Do **not** add WebGL render or screenshot regression suites (no strong prior art; brittle).
- Sim step tests only if fairness constants change.

### Primary automated seam (preferred single seam)

- **Visual registry + material tokens** (pure TypeScript).
  - Ship kit ids and enemy kinds still resolve.
  - Projectile roles used by the playfield resolve.
  - Player projectile / thruster tokens remain cool family; enemy projectile / hostile accent tokens remain warm family (no silent swap to cyan hostiles or magenta requirement).
  - Detail level Low omits optional deep-space or thruster extras that Medium includes when such flags exist.

### Secondary automated seam

- Existing pure token/registry tests in the procedural view tree (extend, do not replace).
- Sim step tests only for fairness-only constant changes.

### Manual smoke (acceptance bar)

1. Run reads as **deep space**, not a trench corridor or desk grid.
2. No new colossal wall shaft architecture.
3. Threat fire and hostile accents stay **warm** (current system), not magenta-retuned.
4. Player thrusters and shots read **cyan/cool** with visible plume or trail energy on Medium+.
5. All four kits still nameable; Hangar matches Run thruster language.
6. Team colors hold under Medium bloom; Low keeps identity with reduced density.
7. Presentation juice still fires on hit/kill/bomb/pickup/death.
8. Movement band remains playable and uncluttered; scenery subordinate to combat.

### Prior art

- Procedural premium interim PRD testing split: pure registry/token tests + manual visual checklist.
- Existing vitest coverage for material tokens and registry under the procedural view tree.
- Presentation event buffer tests remain the juice authority pattern (do not re-test via mesh).

## Out of Scope

- Building colossal corridor trench walls, floor shafts, or cyan wall-rail architecture as the world identity.
- Retuning threat projectile/hull colors to key-art magenta/pink.
- Full rear-chase camera re-architecture or changing sim movement from the XY movement band model.
- Production GLB/Tripo/GPT-image-2 pipeline, textures as a requirement, dual procedural/GLB flags.
- Custom hull uber-shaders, DOF, SSR, heavy AO, cinematic camera systems, aim kick, player-lag camera follow as requirements.
- New ships, enemies, weapons, waves, meta upgrades, or combat rule changes unrelated to proven fairness-only radius/hull tweaks.
- Full music direction or new SFX set.
- Mobile/touch, multiplayer, cloud saves.
- Rewriting the quality tier model or Settings schema.
- Automated visual regression / screenshot pipelines.
- Replacing brand name Corridor Signal or rewriting domain glossary terms for movement band / world stream.

## Further Notes

- Origin: key-art review of the Corridor Signal reference image; camera/composition analysis; procedural scene audit; user refinements (“drop the corridor feel, keep it deep space; keep threat color as-is”).
- Domain language: Run, movement band, world stream, ship kit, presentation event, endless survival, Hangar, quality Low/Medium/High. Brand “Corridor Signal” describes the hold-the-band fantasy, not mandatory trench scenery.
- This PRD refines direction after procedural premium interim; it does not reopen resolved ship-kit identity combat rules.
- Prefer fewer seams: one presentation registry/token surface plus docs. Avoid parallel “look target” systems.
- When implementing, treat rejected audit items (mega-walls, magenta fire) as closed unless a later product decision reopens them explicitly.
- Manual acceptance is the finish line for art feel; automated tests only guard invariants (registry, team color roles, detail ladder flags).
