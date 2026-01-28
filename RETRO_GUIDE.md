# Retro Diffusion Quick Reference

## API Usage (Poe.com)

```bash
curl "https://api.poe.com/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $POE_API_KEY" \
  -d '{
    "model": "retro-diffusion-core",
    "messages": [{"role": "user", "content": "your prompt here"}],
    "extra_body": {
      "style": "rd_fast__game_asset",
      "width": "64",
      "height": "64",
      "removebg": true,
      "native": true
    }
  }'
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `style` | string | Style preset (see styles below) |
| `seed` | string | Random seed for reproducibility |
| `width` / `height` | string | Output size (64-512, MC styles: 16-128) |
| `tilex` / `tiley` | boolean | Seamless tiling |
| `native` | boolean | Return at native resolution |
| `removebg` | boolean | Transparent background |
| `input_image` | string | URL for img2img reference |
| `strength` | number | Reference influence (0.0-1.0, lower = closer) |
| `input_palette` | string | URL of palette image |
| `bypass_prompt_expansion` | boolean | Skip auto prompt enhancement |

## Prompt Format

```
"detailed pixel art of [subject], [features], [colors], [view], pixel art style, pixel art"
```

**Negative prompt** (always include):
```
"muted, dull, hazy, muddy colors, blurry, mutated, deformed, noise, stock image, borders, frame, watermark, text, signature, cropped, out of frame"
```

---

## Available Styles

### RD Fast (64x64 → 512x512)

| Style | Use Case |
|-------|----------|
| `rd_fast__game_asset` | Sprites with transparent backgrounds |
| `rd_fast__simple` | Minimal shapes, simple shading |
| `rd_fast__detailed` | High detail with lots of shading |
| `rd_fast__retro` | Classic arcade aesthetic |
| `rd_fast__portrait` | Character portraits |
| `rd_fast__texture` | Flat textures (stone, brick, wood) |
| `rd_fast__ui` | Interface elements |
| `rd_fast__item_sheet` | Multiple objects on simple bg |
| `rd_fast__character_turnaround` | Front/side/back views |
| `rd_fast__1_bit` | Two-color black and white |
| `rd_fast__low_res` | General low-res pixel art |
| `rd_fast__mc_item` | Minecraft items (16-128px) |
| `rd_fast__mc_texture` | Minecraft textures (16-128px) |
| `rd_fast__no_style` | No style influence |
| `rd_fast__default` | Clean anime-influenced pixel art |

### RD Plus (64x64 → 512x512)

| Style | Use Case |
|-------|----------|
| `rd_plus__default` | Clean with bold colors/outlines |
| `rd_plus__retro` | PC98-inspired classic |
| `rd_plus__watercolor` | Watercolor painting aesthetic |
| `rd_plus__textured` | Semi-realistic with heavy shading |
| `rd_plus__cartoon` | Simple shapes, bold outlines |
| `rd_plus__classic` | Medium-res, strong outlines |
| `rd_plus__low_res` | High quality low-res assets |
| `rd_plus__ui_element` | UI components |
| `rd_plus__item_sheet` | Object sheets |
| `rd_plus__skill_icon` | Ability icons |
| `rd_plus__character_turnaround` | Multi-angle characters |
| `rd_plus__environment` | One-point perspective scenes |
| `rd_plus__isometric` | 45° isometric perspective |
| `rd_plus__isometric_asset` | Isometric objects |
| `rd_plus__topdown_map` | 3/4 top-down maps |
| `rd_plus__topdown_asset` | 3/4 top-down assets |
| `rd_plus__topdown_item` | Small top-down items |
| `rd_plus__mc_item` | Minecraft items (enhanced) |
| `rd_plus__mc_texture` | Minecraft textures (enhanced) |

### Animation Styles

| Style | Size | Output |
|-------|------|--------|
| `animation__four_angle_walking` | 48x48 only | Walking spritesheet (web only) |
| `animation__8_dir_rotation` | 80x80 only | 8-direction rotation |
| `animation__vfx` | 24-96px (1:1) | Effect animations |
| `animation__any_animation` | 64x64 only | Custom animations |

---

## Space Shooter Asset Prompts

### Player Ships

| Type | Prompt | Size | Style |
|------|--------|------|-------|
| Arcade fighter | "player spaceship, sleek fighter jet, blue silver, glowing engine, top-down, retro arcade" | 64x64 | `rd_fast__retro` |
| Detailed starfighter | "futuristic starfighter, angular design, orange cockpit glow, dual blue plasma engines, metallic silver, top-down" | 128x128 | `rd_fast__detailed` |
| Heavy gunship | "heavy armored spaceship, bulky industrial, multiple turrets, thick armor, grey red military, top-down" | 64x64 | `rd_plus__classic` |
| Minimal 8-bit | "simple spaceship, minimal geometric, pointed nose, angular wings, classic arcade" | 32x32 | `rd_fast__low_res` |

### Enemy Ships

| Type | Prompt | Size | Style |
|------|--------|------|-------|
| Fodder | "small enemy fighter, menacing angular, red black, single engine, top-down" | 32x32 | `rd_fast__game_asset` |
| Interceptor | "enemy interceptor, twin engines, green weapon pods, angular, dark metal, top-down" | 64x64 | `rd_fast__detailed` |
| Kamikaze | "suicide bomber ship, explosive design, glowing core, orange red warning, top-down" | 32x32 | `rd_fast__retro` |
| Drone | "small enemy drone, circular mechanical, single red sensor eye, top-down" | 24x24 | `rd_fast__simple` |
| Organic alien | "alien organic ship, biological, tentacles, bioluminescent purple, insectoid, top-down" | 64x64 | `rd_pro__scifi` |
| Battlecruiser | "enemy battlecruiser, large warship, multiple turrets, dark purple gold trim, top-down" | 128x128 | `rd_plus__topdown_asset` |

### Bosses (use 256x256 max)

```
Mechanical: "massive boss battleship, heavy armor, rotating turrets, command bridge, glowing red weak points, dark steel warning lights, top-down"
Alien: "alien mothership boss, organic mechanical hybrid, central glowing eye, tentacles, purple bioluminescent, top-down"
Station: "enemy space station boss, rotating rings, weapon platforms, command tower, industrial warning beacons, top-down"
```

### Projectiles

| Type | Prompt | Size |
|------|--------|------|
| Laser | "blue laser beam projectile, glowing energy trail" | 8x32 |
| Plasma | "green plasma bolt sphere, bright glowing core" | 16x16 |
| Charged | "yellow energy orb, charged power shot, bright aura" | 32x32 |
| Missile | "sci-fi homing missile, red warhead, exhaust flame" | 16x32 |
| Bullet | "small yellow bullet, metallic shine" | 8x8 |

### Explosions (use `animation__vfx`, 1:1 ratio)

```
Small: "small impact explosion, orange yellow sparks burst" (32x32)
Ship: "fiery explosion, orange red flames, black smoke, debris" (64x64)
Boss: "massive space explosion, bright white core, expanding shockwave, debris" (128x128)
```

### Power-ups (32x32, `rd_fast__game_asset`, removebg: true)

```
Shield: "blue energy shield orb, glowing protective aura, floating"
Weapon: "weapon upgrade power-up, triple barrel icon, golden metallic"
Health: "red health pack, glowing medical cross"
Extra life: "1-up extra life icon, small spaceship silhouette, green glow"
Score: "golden star collectible, shiny metallic, spinning"
```

### Backgrounds (use tilex/tiley: true)

```
Starfield: "dense starfield space background, twinkling stars various sizes, deep blue black void" (256x256, texture)
Nebula: "purple pink nebula cloud, cosmic gas wisps, glowing edges" (256x256, default)
Planet: "blue green planet with white clouds, earth-like, atmosphere glow" (64-128px)
Asteroid: "gray asteroid rock, jagged crater surface, space debris" (16-48px)
```

### UI Elements (`rd_fast__ui` or `rd_plus__ui_element`)

```
Health bar: "sci-fi health bar frame, metallic angular border" (128x16)
Boss bar: "large boss health bar, red gradient fill, ornate frame" (256x24)
Heart: "pixel heart icon, red health indicator, retro game" (16x16, removebg)
Button: "sci-fi button, glowing edges, metallic surface" (64x24, removebg)
```

---

## Settings by Asset Type

| Asset | Style | Size | Key Settings |
|-------|-------|------|--------------|
| Player ships | `game_asset`, `detailed` | 32-128px | `removebg: true` |
| Enemies | `game_asset`, `detailed` | 24-128px | `removebg: true` |
| Bosses | `topdown_asset` | 128-256px | `removebg: true` |
| Projectiles | `game_asset` | 8-32px | `removebg: true` |
| Explosions | `animation__vfx` | 32-96px | 1:1 ratio |
| Power-ups | `game_asset` | 16-32px | `removebg: true` |
| Backgrounds | `texture`, `default` | 128-256px | `tilex/tiley: true` |
| UI | `ui`, `ui_element` | varies | - |

---

## Key Tips

- **Max 256x256** for cleanest results (models trained at this size and below)
- **Use seeds** for iterative prompting - change prompt, keep seed constant
- **No character consistency** - each generation is unique; use turnaround styles or generate variations and pick favorites
- **Palette control** - use `input_palette` to constrain colors for asset consistency
- **Animation via API** produces single poses, not full sheets - use web interface for spritesheets
- **Powers of 2** work best (32, 64, 128, 256)
