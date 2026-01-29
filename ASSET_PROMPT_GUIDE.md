# Retro Diffusion Core: Complete Space Shooter Asset Prompt Guide

Retro Diffusion Core is a specialized AI pixel art generator trained specifically for grid-aligned, limited-palette artwork—making it ideal for authentic space shooter game assets. Unlike generic AI models, it produces clean sprites that often need minimal post-processing. The platform offers three model tiers (RD_Fast, RD_Plus, RD_Pro) with dedicated styles for game assets, animations, and UI elements, accessible via web interface, Aseprite extension, or API.

This guide provides **practical, copy-paste prompts** with optimal settings for every space shooter asset category—from player ships to UI elements.

---

## Understanding the core prompting system

Retro Diffusion uses **simple natural language prompts** rather than complex keyword chains. The recommended format follows this structure:

```
"detailed pixel art of [subject], pixel art style, pixel art --ar [width]:[height] --style [style_name]"
```

**Universal negative prompt** (use for all generations):
```
"muted, dull, hazy, muddy colors, blurry, mutated, deformed, noise, stock image, borders, frame, watermark, text, signature, username, cropped, out of frame"
```

The **three key styles** for space shooter assets are:
- **`rd_fast__game_asset`**: Best for sprites with transparent backgrounds (64x64 to 384x384)
- **`rd_pro__scifi`**: High contrast with glowing details, clean outlines—ideal for sci-fi (up to 256x256)
- **`rd_fast__retro`**: Classic arcade aesthetic for authentic 8-bit feel

Always set `remove_bg: true` for sprites, and stay at or below **256×256 native resolution** for optimal quality.

---

## Player spaceship prompts across styles

Player ships benefit from distinct silhouettes and recognizable designs. Top-down view is standard for vertical shooters; side view works for horizontal scrollers.

### Classic arcade fighter (32x32 or 64x64)
```
Prompt: "player spaceship, sleek fighter jet design, blue and silver colors, glowing engine exhaust, top-down view, retro arcade style"
Style: rd_fast__retro
Settings: remove_bg: true, width: 64, height: 64
```

### Modern detailed starfighter (128x128)
```
Prompt: "futuristic player starfighter, angular aggressive design, orange cockpit canopy glow, dual engines with blue plasma flames, metallic silver body, top-down view"
Style: rd_fast__detailed
Settings: remove_bg: true, width: 128, height: 128
```

### Heavy armored gunship (64x64)
```
Prompt: "heavy armored player spaceship, bulky industrial design, multiple gun turrets, thick armor plating, grey and red military colors, top-down perspective"
Style: rd_plus__classic
Settings: remove_bg: true, width: 64, height: 64
```

### Minimalist 8-bit ship (16x16 or 32x32)
```
Prompt: "simple player spaceship, minimal geometric design, pointed nose, small angular wings, classic arcade game"
Style: rd_fast__low_res
Settings: remove_bg: true, width: 32, height: 32
```

### Side-scrolling fighter (horizontal shooter)
```
Prompt: "player spaceship side view, sleek horizontal design, visible cockpit, engine flames trailing behind, sci-fi fighter"
Style: rd_fast__game_asset
Settings: remove_bg: true, width: 96, height: 48
```

For **8-direction rotation spritesheets**, use `animation__8_dir_rotation` at exactly 80x80 pixels.

---

## Enemy ships and alien creatures

Enemy variety drives gameplay interest. Create visual hierarchy through size, color, and design complexity—fodder enemies stay simple while elites demand attention.

### Basic fodder enemy (32x32)
```
Prompt: "small enemy fighter, menacing angular shape, red and black hostile colors, single engine, aggressive design, top-down view"
Style: rd_fast__game_asset
Settings: remove_bg: true, width: 32, height: 32
```

### Medium interceptor (48x48 or 64x64)
```
Prompt: "enemy interceptor spaceship, twin engines, green glowing weapon pods, angular aggressive silhouette, dark metal with accent lights, top-down view"
Style: rd_fast__detailed
Settings: remove_bg: true, width: 64, height: 64
```

### Kamikaze/suicide bomber (32x32)
```
Prompt: "suicide bomber enemy ship, explosive unstable design, glowing volatile core, angular aggressive shape, orange and red warning colors, top-down"
Style: rd_fast__retro
Settings: remove_bg: true, width: 32, height: 32
```

### Drone swarm unit (24x24)
```
Prompt: "small enemy drone, circular mechanical design, single red sensor eye, minimalist hostile appearance, top-down view"
Style: rd_fast__simple
Settings: remove_bg: true, width: 24, height: 24
```

### Organic alien ship (64x64)
```
Prompt: "alien organic spaceship, biological living design, tentacle appendages, bioluminescent purple glow, insectoid carapace appearance, top-down view"
Style: rd_pro__scifi
Settings: remove_bg: true, width: 64, height: 64
```

### Heavy battlecruiser (96x96 to 128x128)
```
Prompt: "enemy battlecruiser, large imposing warship, multiple weapon turret hardpoints, dark purple hull with gold accent trim, intimidating angular design, top-down view"
Style: rd_plus__topdown_asset
Settings: remove_bg: true, width: 128, height: 128
```

---

## Boss enemies that command attention

Boss designs should feel **massive and threatening** with visible weak points for gameplay clarity. Use larger resolutions (192x192 to 256x256) for detail.

### Mechanical dreadnought boss (256x256)
```
Prompt: "massive boss battleship, heavily armored hull, multiple rotating weapon turrets, visible command bridge structure, glowing red weak points, intimidating mechanical design, dark steel with warning lights, top-down view"
Style: rd_plus__topdown_asset
Settings: remove_bg: true, width: 256, height: 256
```

### Alien mothership boss (256x256)
```
Prompt: "alien mothership boss creature, organic mechanical hybrid design, central glowing eye sensor, writhing tentacle appendages, purple bioluminescent patterns, massive intimidating scale, top-down view"
Style: rd_pro__scifi
Settings: remove_bg: true, width: 256, height: 256
```

### Space station boss (256x256)
```
Prompt: "enemy space station boss, rotating ring structures, multiple weapon platform modules, central command tower, industrial design with warning beacon lights, massive scale, top-down view"
Style: rd_plus__classic
Settings: remove_bg: true, width: 256, height: 256
```

### Multi-part modular boss core (128x128 per segment)
```
Prompt: "boss spaceship core module, mechanical armored sphere, glowing vulnerable weak point center, detachable component ports, industrial sci-fi design, top-down"
Style: rd_fast__detailed
Settings: remove_bg: true, width: 128, height: 128
```

---

## Projectiles and weapon effects

Projectiles need **immediate visual clarity**—players must instantly distinguish their shots from enemy fire. Keep projectiles small and bright.

### Laser beams and energy shots
| Asset | Prompt | Size | Style |
|-------|--------|------|-------|
| Basic laser | "blue laser beam projectile, glowing energy trail, sci-fi weapon shot" | 8×32 or 16×64 | game_asset |
| Plasma bolt | "green plasma bolt sphere, bright glowing core, energy projectile" | 16×16 | game_asset |
| Charged shot | "yellow energy orb projectile, charged power shot, bright aura glow" | 32×32 | game_asset |
| Triple spread | "three parallel red laser beams, spread shot pattern, pixel art" | 32×32 | game_asset |
| Lightning | "cyan electric lightning bolt projectile, jagged energy, pixel art" | 16×48 | game_asset |

### Physical projectiles
| Asset | Prompt | Size | Style |
|-------|--------|------|-------|
| Bullet | "small yellow bullet projectile, metallic shine, game asset" | 8×8 | game_asset |
| Missile | "sci-fi homing missile, red warhead, exhaust flame trail, pixel art" | 16×32 | game_asset |
| Torpedo | "space torpedo, blue engine glow, sleek aerodynamic design" | 24×48 | game_asset |

### Explosions (use `animation__vfx` style for animated versions)
| Asset | Prompt | Size |
|-------|--------|------|
| Small impact | "small impact explosion, orange yellow sparks burst, pixel art effect" | 32×32 |
| Ship destruction | "fiery explosion, orange red flames, black smoke, debris fragments" | 64×64 |
| Boss explosion | "massive space explosion, bright white core, expanding shockwave ring, debris" | 128×128 |
| Energy burst | "blue plasma explosion burst, electric sparks, sci-fi effect" | 48×48 |

For **animated explosions**, use:
```
Prompt: "explosion animation, orange yellow flames, expanding shockwave, space debris"
Style: animation__vfx
Size: 48×48 or 64×64 (must be 1:1 aspect ratio)
Settings: return_spritesheet: true
```

---

## Power-ups and collectible items

Power-ups need **instant recognition** during fast gameplay. Use bright, saturated colors that pop against dark space backgrounds.

### Shield and defense power-ups
```
Shield orb: "blue energy shield power-up orb, glowing protective aura, floating, pixel art item" (32×32, game_asset)
Bubble shield: "transparent bubble shield pickup, iridescent rainbow glow, pixel art" (32×32, game_asset)
Armor boost: "golden armor plating power-up, metallic shine, protective icon" (32×32, game_asset)
```

### Weapon upgrades
```
Spread shot: "weapon upgrade power-up, triple barrel icon, golden metallic, pixel art" (32×32, game_asset)
Laser upgrade: "red laser crystal power-up, glowing energy, weapon enhancement" (32×32, game_asset)
Missile pack: "missile ammunition power-up, military crate, ordnance icon" (32×32, game_asset)
Fire rate: "rapid fire upgrade icon, speed arrows symbol, yellow glow, pixel art" (32×32, game_asset)
```

### Score and health items
```
Health pack: "red health pack, glowing medical cross symbol, pixel art game item" (32×32, game_asset)
Extra life: "1-up extra life icon, small spaceship silhouette, green glow" (32×32, game_asset)
Score star: "golden star collectible, shiny metallic, spinning, pixel art" (16×16, game_asset)
Crystal gem: "glowing blue crystal gem, valuable collectible, faceted surface" (16×16, game_asset)
```

---

## Space backgrounds and environmental elements

Backgrounds require **seamless tiling** for infinite scrolling. Use `tile_x: true` and `tile_y: true` parameters.

### Starfield layers (parallax scrolling)
```
Dense starfield: "dense starfield space background, twinkling stars various sizes, deep blue black void, pixel art"
Style: texture, Size: 256×256, Settings: tile_x: true, tile_y: true

Sparse distant layer: "sparse distant stars, dark space background layer, subtle minimal, pixel art"
Style: texture, Size: 256×128, Settings: tile_x: true, tile_y: true
```

### Nebulae (mid-layer visual interest)
```
Purple nebula: "purple pink nebula cloud, cosmic gas wisps, glowing edges, pixel art background"
Blue nebula: "blue cosmic nebula, ethereal gas formation, star cluster, pixel art"
Red nebula: "red orange fiery nebula, dramatic space clouds, cosmic dust, pixel art"
Style: default, Size: 256×256, Settings: tile_x: true
```

### Celestial objects (decoration, obstacles)
| Object | Prompt | Size |
|--------|--------|------|
| Earth-like planet | "blue green planet with white clouds, earth-like world, atmosphere glow" | 64×64 or 128×128 |
| Gas giant | "orange banded gas giant planet, jupiter-like, atmospheric storms" | 96×96 |
| Ringed planet | "ringed planet with asteroid belt ring, saturn-like, pixel art" | 128×96 |
| Small asteroid | "gray asteroid rock, jagged crater surface, space debris, pixel art" | 16×16 to 32×32 |
| Large asteroid | "large brown asteroid, heavily cratered surface, space rock" | 48×48 to 64×64 |
| Ice asteroid | "icy blue crystalline asteroid, frozen surface, valuable, pixel art" | 32×32 |

---

## UI elements for game interfaces

Use **`rd_fast__ui`** or **`rd_plus__ui_element`** styles for interface components.

### Health and status bars
```
Health bar frame: "sci-fi health bar frame, metallic angular border, pixel art UI element"
Style: ui, Size: 128×16

Energy meter: "blue energy bar, glowing gradient fill, sci-fi HUD element, pixel art"
Style: ui, Size: 100×12

Boss health bar: "large boss health bar, red fill gradient, dramatic ornate frame, pixel art"
Style: ui_element, Size: 256×24
```

### Life and status indicators
```
Heart icon: "pixel heart icon, red health indicator, retro game style" (16×16, ui, remove_bg: true)
Ship lives: "small spaceship icon, extra life indicator, pixel art UI" (16×16, ui, remove_bg: true)
Shield icon: "shield status icon, blue glowing, protective symbol" (16×16, ui, remove_bg: true)
```

### Score and HUD elements
```
Score frame: "score display frame, metallic sci-fi border, digital readout area, pixel art"
Style: ui_element, Size: 96×32

HUD panel: "sci-fi HUD frame border, angular metallic design, dark glass center, pixel art"
Style: ui_element, Size: 128×64

Button: "sci-fi button, glowing edges, pressed state, metallic surface, pixel art UI"
Style: ui, Size: 64×24, remove_bg: true

Weapon select: "weapon selection UI frame, hexagonal sci-fi style, highlighted border"
Style: ui_element, Size: 48×48
```

---

## Optimal settings by asset type

| Asset Category | Recommended Style | Resolution Range | Key Parameters |
|----------------|-------------------|------------------|----------------|
| Player ships | `rd_fast__game_asset`, `rd_pro__scifi` | 32×32 to 128×128 | `remove_bg: true` |
| Enemy ships | `rd_fast__game_asset`, `rd_fast__detailed` | 24×24 to 128×128 | `remove_bg: true` |
| Boss enemies | `rd_plus__topdown_asset`, `rd_pro__scifi` | 128×128 to 256×256 | `remove_bg: true` |
| Projectiles | `rd_fast__game_asset` | 8×8 to 32×64 | `remove_bg: true` |
| Explosions | `animation__vfx` | 32×32 to 96×96 | `return_spritesheet: true` |
| Power-ups | `rd_fast__game_asset`, `rd_fast__item_sheet` | 16×16 to 32×32 | `remove_bg: true` |
| Backgrounds | `rd_fast__texture`, `default` | 128×128 to 256×256 | `tile_x: true`, `tile_y: true` |
| UI elements | `rd_fast__ui`, `rd_plus__ui_element` | 16×16 to 256×32 | varies |
| Animated sprites | `animation__vfx`, `animation__8_dir_rotation` | Fixed per style | `return_spritesheet: true` |

---

## Color palette recommendations for space shooters

Space shooters benefit from **high contrast** between sprites and backgrounds. These Lospec palettes work exceptionally well:

- **Berry Nebula** (8 colors): Neon blue to deep purple—ideal for cosmic nebulae
- **Neon Space** (10 colors): Blue/red gradient designed specifically for space games
- **Baldur - Neon Darkness** (4 colors): High-contrast teal/orange, great for minimalist style
- **Retro 8** (8 colors): 80s retro futuristic aesthetic

**Palette workflow**: Generate with default colors, then use Retro Diffusion's `input_palette` parameter or post-process with the "Palettize" tool. Apply palette twice—first "Adaptive" with 12 max colors, then your chosen palette.

Key principles for space shooter palettes:
- Keep **8-16 colors maximum** for authentic retro feel
- Use **bright, saturated projectiles** against dark backgrounds
- Player ships should use **cool colors** (blue, cyan) while enemies use **warm colors** (red, orange, purple)
- Ensure **clear visual hierarchy** through color temperature

---

## Animation considerations and limitations

Retro Diffusion's animation capabilities are **API/cloud-only**—the local Aseprite extension generates static sprites only.

**Available animation styles:**
- `animation__vfx` (24×24 to 96×96): Explosions, fire, energy effects
- `animation__8_dir_rotation` (80×80 fixed): Eight-direction ship rotations
- `animation__any_animation` (64×64 fixed): Custom animation descriptions

**Important limitation**: The model lacks character consistency across generations. Each prompt creates a new interpretation, so generating "the same ship from different angles" requires careful prompting of ALL visual details or manual post-editing.

**Best practices for animation-ready sprites:**
- Design with **few frames in mind** (2-8 frames per animation cycle)
- Create **looping cycles** for engine flames, shield effects, idle states
- Export as **spritesheets** for game engine compatibility
- Add subtle **idle animations** (engine flicker, slight movement) to prevent static appearance

---

## Effective negative prompts for clean assets

**Standard negative prompt** (use always):
```
"muted, dull, hazy, muddy colors, blurry, mutated, deformed, noise, stock image, borders, frame, watermark, text, signature, username, cropped, out of frame"
```

**Enhanced for crisp sprites**, add:
```
"distorted, warped, stretched, low quality, artifacts, jpeg artifacts, grainy"
```

**For character/ship sprites**, add:
```
"extra parts, missing parts, asymmetrical, broken, incomplete"
```

---

## Community resources and showcases

**Official galleries:**
- Astropulse Gallery (astropulse.co/#retrodiffusiongallery) showcases 100% AI-generated pixel art
- Retro Diffusion website (retrodiffusion.ai) offers 50 free credits to experiment
- Poe integration (poe.com/Retro-Diffusion-Core) provides accessible testing

**Community hubs:**
- Discord server (discord.gg/retrodiffusion) serves as the primary community
- Twitter @RealAstropulse shares previews and updates
- Itch.io product page comments contain real-world user experiences

**Supporting resources:**
- Lospec palette database (lospec.com/palette-list/tag/space) for space-themed palettes
- OpenGameArt (opengameart.org) for reference and inspiration
- Itch.io space pixel art assets for style reference

---

## Workflow summary for efficient asset creation

1. **Start with the recommended prompt format**: "detailed pixel art of [subject], [key visual features], [colors], [view angle], pixel art style"

2. **Select appropriate style**: `rd_fast__game_asset` for most sprites, `rd_pro__scifi` for detailed sci-fi, `rd_fast__retro` for arcade aesthetic

3. **Match resolution to use case**: 32×32 for small sprites, 64×64 for standard sprites, 128×128 for detailed assets, 256×256 maximum for bosses

4. **Always include the standard negative prompt** for cleaner results

5. **Generate 4+ variations** (`num_images: 4`) and select the best

6. **Post-process**: Palettize to your chosen palette, remove background if needed, manually clean any artifacts

7. **Test in-game context**: Verify visibility against backgrounds, ensure consistent style across asset types

The combination of Retro Diffusion's specialized training and these targeted prompts produces **production-ready space shooter assets** with minimal manual editing—achieving authentic pixel art aesthetics that would otherwise require significant artistic skill and time.