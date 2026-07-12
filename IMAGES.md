# Image Generation Backlog

Images to generate once an image-generation capability is available. Every current equivalent ships procedurally (canvas textures, CSS, SVG); these assets replace or upsell those stand-ins without changing gameplay code.

Art direction constants for every prompt: deep-void navy/black space (#03070f), signal cyan (#5ee7ff) for player/UI, ember orange-red (#ff5a30) for hostiles, salvage gold (#f6ca62) for rewards, clean hard-surface sci-fi, no text unless specified.

## 1. Skies and backdrops (integrated)

| # | Asset | Path | Res | Prompt | Integration |
|---|-------|------|-----|--------|-------------|
| 1.1 | Nebula backdrop plate | `public/assets/textures/nebula-backdrop.png` | 4K | Create a wide game background plate of a deep-space nebula corridor: dark navy void, faint teal and indigo nebula banks, sparse warm ember accents, dense pinprick starfield, layered depth, readable horizon glow at the top, suitable behind a real-time Three.js scene, no foreground subject, no text. | Replace `getNebulaTexture()` canvas plate in `src/view/procedural/ProceduralTextures.ts`; load as `TextureLoader` map on the Backdrop plane in `WorldCorridor.tsx`. Keep offset drift code. |
| 1.2 | Nebula wisp sprites (sheet of 4) | `public/assets/textures/nebula-wisps.png` | 2K | Create a 2x2 sprite sheet of soft volumetric nebula wisps on pure black: teal, indigo, violet, and dim ember variants, soft alpha edges, no hard silhouettes, game particle sprites, no text. | Slice into 4 UV quadrants for `NebulaWisps` in `WorldCorridor.tsx` (replace tinted `getSoftGlowTexture()` planes). Additive blending stays. |

## 2. Textures and trim (2.1-2.3 integrated; 2.4 deferred)

| # | Asset | Path | Res | Prompt | Integration |
|---|-------|------|-----|--------|-------------|
| 2.1 | Hull trim sheet | `public/assets/textures/hull-trim-sheet.png` | 2K | Create a seamless sci-fi spaceship hull trim sheet texture: orthographic, PBR-friendly albedo, brushed gunmetal panels, recessed seams, access hatches, subtle wear on edges, thin cyan light channels, no perspective, no baked shadows, no text. | Integrated via new `getHullTrimTexture()`, wired as `map` on `bodyPrimary`/`bodySecondary` roles in `MaterialLibrary.ts` only. Enemies + DerelictFleet keep the procedural `getPanelLineTexture()`. Roughness stays the procedural `getMicroNoiseTexture()` (no roughness PNG generated). |
| 2.2 | Stream flow map | `public/assets/textures/stream-flow.png` | 2K | Create a seamless vertical energy-flow texture for a hyperspace conveyor lane: near-black base, thin cyan-teal flow filaments of varied length streaming downward, faint wide channel glow bands, tileable top-to-bottom, no perspective, no text. | Replace `getStreamFlowTexture()` on the `StreamRibbon` plane in `WorldCorridor.tsx`; keep V-scroll code. |
| 2.3 | Asteroid albedo/roughness | `public/assets/textures/asteroid-rock.png` | 2K | Create a seamless dark basalt asteroid rock texture: charcoal grey with faint blue mineral veins, fine regolith detail, PBR-friendly albedo, orthographic, no strong baked lighting, no text. | Add as `map` on the `AsteroidField` material in `WorldCorridor.tsx` (needs UV via `IcosahedronGeometry` default UVs; acceptable stretch at detail 1). |
| 2.4 | Hazard decal strip | `public/assets/decals/hazard-stripes.png` | 1K | Create a crisp sci-fi hazard decal strip: diagonal ember-orange and black warning stripes with worn edges, transparent background, game decal, high contrast at small size, no text. | DEFERRED. Asset validated and on disk, not yet wired. Colossus pods and gate towers are baked into single merged/instanced geometries with no per-part meshes and the repo has no decal/polygonOffset pattern; needs new decal-instancing infra (separate hazard-textured meshes tracked per active instance in the frame loop). |

## 3. Ship and enemy concept sheets (for future image-to-3D)

| # | Asset | Path | Res | Prompt | Integration |
|---|-------|------|-----|--------|-------------|
| 3.1 | Vanguard concept | `assets/concepts/ship-vanguard.png` | 2K | Create a clean 3D-generation reference image of a sci-fi interceptor "Vanguard": centered single object, 3/4 top view, tapered nose cone, twin engines, compact delta wings, gunmetal hull with cyan light channels, readable silhouette, clear material zones, plain dark background, no motion blur, no cropped parts, no text. | Feed to `threejs-3d-generator` image-to-3D when `TRIPO_API_KEY` is available; replaces `VanguardFactory` visual (keep sim hitbox). |
| 3.2 | Striker concept | `assets/concepts/ship-striker.png` | 2K | Same framing as 3.1 for a twin-boom gunship "Striker": slim central fuselage, two forward gun booms with exposed barrels, swept rear wings, aggressive hot-rod stance, gunmetal with cyan accents, plain dark background, no text. | Image-to-3D input; replaces `StrikerKit`. |
| 3.3 | Aegis concept | `assets/concepts/ship-aegis.png` | 2K | Same framing for an armored bulwark ship "Aegis": wide layered wing-body, chevron front armor plates, glowing shield emitter ring, triple engines, heavy silhouette, plain dark background, no text. | Image-to-3D input; replaces `AegisKit`. |
| 3.4 | Phantom concept | `assets/concepts/ship-phantom.png` | 2K | Same framing for a stealth stiletto interceptor "Phantom": needle nose, hard-swept blade wings, single oversized engine, canted twin tail fins, dark stealth hull with a thin dorsal cyan glow spine, plain dark background, no text. | Image-to-3D input; replaces `PhantomKit`. |
| 3.5 | Enemy family sheet | `assets/concepts/enemy-family-sheet.png` | 2K | Create a game enemy lineup concept sheet, side by side on plain dark background: insectoid scout pod, arrowhead diver drone, twin-barrel turret barge, catamaran gun platform, scythe-winged elite fighter, caged crystal core construct, and a massive layered battleship. Rust-red hostile hulls with ember-orange glow accents, readable distinct silhouettes, no text. | Art reference for iterating `enemyGeometry.ts`; individual crops can seed image-to-3D for the Colossus hero enemy. |

## 4. UI art and icons

| # | Asset | Path | Res | Prompt | Integration |
|---|-------|------|-----|--------|-------------|
| 4.1 | TCFU faction mark | `public/assets/ui/tcfu-mark.png` | 1K | Create a crisp game UI faction emblem: angular winged chevron insignia around a vertical lance, cyan on transparent, high contrast at small size, sci-fi military stencil style, no tiny unreadable text. | Optional upgrade for `BrandMark.tsx` SVG; also reusable as a world decal on ship hulls (UI/world motif cohesion). |
| 4.2 | Powerup icon set | `public/assets/ui/powerup-icons.png` | 1K | Create a 3x2 sprite sheet of six game pickup icons on transparent: shield ring, warhead, repair cross, overclock chevrons, tri-shot fan, bounty gem. Line-art style with flat fills, one signal color per icon (cyan, gold, green, gold, violet, gold), readable at 24 px, no text. | HUD powerup badges in `RunHud.tsx` (replace letter glyphs) and Results/UpgradeBay iconography. |
| 4.3 | Meta branch icons | `public/assets/ui/meta-icons.png` | 1K | Create a 2x2 sprite sheet of four upgrade branch icons on transparent: crossed cannons (Arsenal), armored plate (Hull), salvage claw with gear (Salvage), thruster flame (Thrusters). Stencil sci-fi style, cyan monochrome, readable at 32 px, no text. | `UpgradeBayScreen` bay cards. |
| 4.4 | Title key art | `public/assets/ui/title-keyart.png` | 4K | Create dramatic game title background art: a lone cyan-lit interceptor riding a glowing energy conveyor through a dark nebula corridor toward distant hostile silhouettes, cinematic wide composition with empty space in the center-left for a logo, deep navy palette with ember accents, no text. | Optional `TitleScreen` backdrop layer behind the lockup (blend over the live 3D backdrop at low opacity, or replace it on low-power devices). |

## 5. Marketing/meta

| # | Asset | Path | Res | Prompt | Integration |
|---|-------|------|-----|--------|-------------|
| 5.1 | Social/OG still | `public/assets/marketing/og-card.png` | 2K | Create a 1200x630-safe promotional still of an arcade space shooter: interceptor dodging ember plasma bolts over a cyan energy stream, HUD-style frame elements at the edges, bold readable composition at thumbnail size, no text. | `<meta property="og:image">` in `index.html`. |
| 5.2 | Favicon source | `public/assets/marketing/favicon-source.png` | 1K | Create a minimal app icon: cyan lance chevron on deep navy rounded square, readable at 16 px, no text. | Export to `favicon.svg`/PNG sizes. |

## Note

- After integrating any texture, re-run the canvas inspector and re-check the render budget (texture memory) before shipping.
