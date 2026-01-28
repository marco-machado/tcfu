# Retro Diffusion Core: AI-powered pixel art for game developers

**Retro Diffusion Core is a specialized AI system that generates authentic, game-ready pixel art** — solving the persistent problem that mainstream AI tools like DALL-E and Midjourney produce technically incorrect "pixelated-looking" images rather than true pixel art. Unlike generic AI generators, Retro Diffusion maintains proper grid alignment, limited color palettes, and clean edges without anti-aliasing artifacts. For game developers, this means generating sprites, tiles, and UI elements that can go directly into a game engine with minimal cleanup.

## What Retro Diffusion is and how it differs from other AI tools

The platform includes **23+ specialized models** covering different use cases: RD_Fast for quick generation across 15+ styles, RD_Plus for higher-quality scenes and maps, RD_Tile for seamless textures, and RD_Animation for sprite sheet generation. Each model produces outputs at native resolutions between **16×16 and 512×512 pixels**, with optimal results at 256×256 and below where the models were trained.

## Accessing Retro Diffusion via Poe.com

**Poe.com chatbot (Retro Diffusion Core)** provides the quickest entry point. Create a free Poe account, navigate to poe.com/Retro-Diffusion-Core, and start generating with text prompts. The first 50 basic generations are free. Use parameters like `--ar 128:128` for dimensions, `--style rd_fast__game_asset` for style presets, and `--removebg` for transparent backgrounds.

## Poe.com API for programmatic access

Poe.com provides an OpenAI-compatible API that allows programmatic access to Retro Diffusion Core. This enables integration into scripts, pipelines, and applications without using the chat interface.

**Authentication:** Obtain an API key from your Poe.com account settings and set it as an environment variable or include it directly in the Authorization header.

**Basic request structure:**

```bash
curl "https://api.poe.com/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $POE_API_KEY" \
  -d '{
    "model": "retro-diffusion-core",
    "messages": [
      {
        "role": "user",
        "content": "Playful kitten in a flower garden, anime style, vibrant, Ghibli-esque"
      }
    ],
    "extra_body": {
      "style": "rd_plus__default",
      "seed": "1",
      "width": "64",
      "height": "64",
      "tilex": true,
      "tiley": true,
      "iw": 1,
      "native": true,
      "removebg": true
    }
  }'
```

**API parameters in `extra_body`:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `style` | string | Style preset (see available styles below) |
| `seed` | string | Random seed for reproducible results |
| `width` | string | Output width in pixels (64-512, or 16-128 for MC styles) |
| `height` | string | Output height in pixels (64-512, or 16-128 for MC styles) |
| `tilex` | boolean | Enable horizontal seamless tiling |
| `tiley` | boolean | Enable vertical seamless tiling |
| `iw` | number | Image generation strength (0.0-1.0) |
| `native` | boolean | Return at native resolution without upscaling |
| `removebg` | boolean | Remove background for transparent output |
| `input_image` | string | URL of reference image for img2img generation |
| `strength` | number | How much input_image influences output (0.0-1.0, lower = closer to reference) |
| `input_palette` | string | URL of palette image to constrain colors |
| `bypass_prompt_expansion` | boolean | Skip automatic prompt enhancement |

**Notes:**
- The `messages` array follows OpenAI chat format with `role` and `content` fields
- Your prompt goes in the `content` field of a user message
- Generation parameters that would normally be flags (like `--removebg`) go in `extra_body`
- File parameters (`input_image`, `input_palette`) accept URLs to images
- API usage consumes Poe credits similar to the web interface

## Prompt crafting tips

Craft prompts using **simple, natural language** — Retro Diffusion's custom CLIP model favors clear sentence structure over complex prompt engineering. The recommended format is: "detailed pixel art of [subject], pixel art style, pixel art." For example: "detailed pixel art of a knight character in medieval armor, side view, pixel art style, pixel art." Include pose direction (idle, walking, attacking), viewpoint (side view, front view, top-down), and style references (retro RPG, classic JRPG).

Apply a **negative prompt** to avoid common artifacts: "muted, dull, hazy, muddy colors, blurry, mutated, deformed, noise, stock image, borders, frame, watermark, text, signature, cropped, out of frame."

Set dimensions matching your game's requirements. For character sprites, **64×64 to 128×128** work well (64×64 is the minimum for most styles). For environment tiles, use powers of 2 matching your engine's tile size. Enable `--removebg` for transparent backgrounds on sprites that will be composited in-game. Scale down in your game engine for smaller display sizes.

**Leverage reference images** by providing rough sketches or existing sprites to steer the design. For RD Plus and RD Animation styles, adjust the strength parameter (0.0-1.0) to control how much the reference influences output — higher values like 0.8 create more distinct results while lower values stay closer to your reference.

**Iterate and adjust prompts.** Retro Diffusion models respond well to iterative prompting. If the first result isn't ideal, adjust wording, switch styles, or modify palette and dimensions until you get the desired output.

## Asset types and optimal settings

**Character sprites** work best at 32×32 to 128×128 resolution using the `game_asset` or `portrait` styles. Include pose and direction in prompts: "hero standing idle, wearing medieval outfit, colorful retro pixel-art style." Always enable background removal for game integration.

**Tilesets and textures** require the `--tile` modifier for seamless edges — enable this for any textures or map elements that need to repeat seamlessly. Use `rd_fast__texture` style. The dual-prompt blending feature can merge two textures (stone and moss, for example) for environmental variety. Example prompt: "grass and dirt path tileset with stones and flowers, seamless texture."

**Walking animations** use the `animation__four_angle_walking` style. On the web interface, this outputs a sprite sheet with frames organized in a grid ready for direct import. Via API, this style currently produces single walking poses rather than full sprite sheets. Example: "small pirate character with parrot, walking animation, pixel art."

**UI elements** use `rd_fast__ui` or `rd_plus__ui_element` styles. Keep prompts simple and specify exact dimensions. Works well for buttons, frames, health bars, and inventory slots.

**Top-down and isometric maps** perform excellently with `rd_plus__topdown_map` or `rd_plus__isometric` styles. Example: "top-down forest path with trees and rocks, classic JRPG map." These styles output full scene compositions rather than isolated assets.

**Minecraft-specific assets** have dedicated styles: `rd_fast__mc_texture` for block textures and `rd_fast__mc_item` for inventory items. Enable tiling for seamless block faces.

## Critical tips for game development success

**Match resolutions to training data.** The models produce cleanest results at 256×256 and below. Generating at larger sizes introduces color bleed and pixel duplication. Generate at your target game resolution rather than upscaling later.

**Use palette control for asset consistency.** Upload a palette image when generating to constrain colors to a limited set. This is especially important when matching existing assets or adhering to engine restrictions. The Palettize feature can also reduce or change colors post-generation.

**Plan for character variation, not consistency.** Retro Diffusion cannot reliably recreate the same character in different poses — each generation produces something new. Design workflows around this limitation: generate multiple variations and hand-pick favorites, or use the character turnaround style (`rd_fast__character_turnaround`) to get front/side/back views in a single generation.

**Use seeds for reproducible experimentation.** The `--seed` parameter lets you test prompt or style changes while keeping other variables constant. Find a good seed, then iterate on wording.

## Available styles and parameters (Poe reference)

Generate true game ready pixel art in seconds at any resolution between 64x64 and 512x512 across the various styles (MC styles support 16x16-128x128). Create 48x48 walking animations of sprites using the "animation_four_angle_walking" style!

Example message: "A cute corgi wearing sunglasses and a party hat --ar 128:128 --style rd_fast__portrait"

**Settings:**
- `--ar <width>:<height>` - Image size in pixels, larger images cost more. Or aspect ratio like 16:9
- `--style <style_name>` - The name of the style you want to use
- `--seed` - Random number, keep the same for consistent generations
- `--tile` - Creates seamless edges on applicable images
- `--tilex` - Seamless horizontally only
- `--tiley` - Seamless vertically only
- `--native` - Returns pixel art at native resolution, without upscaling
- `--removebg` - Automatically remove the background
- `--iw <0.0-1.0>` - Controls how strong the image generation is. 0.0 for small changes, 1.0 for big changes

**Image-to-image and palette control** (API only):
- `input_image` - URL of reference image for img2img generation
- `strength` - How much the reference influences output (0.0-1.0)
- `input_palette` - URL of palette image to constrain colors
- `bypass_prompt_expansion` - Skip automatic prompt enhancement

**RD Fast styles:**

| Style | Description |
|-------|-------------|
| `rd_fast__default` | Simple clean pixel art with anime illustration influences |
| `rd_fast__simple` | Simple shading with minimalist shapes and designs |
| `rd_fast__detailed` | Pixel art with lots of shading and details |
| `rd_fast__retro` | Classic arcade game aesthetic inspired by early PC games |
| `rd_fast__game_asset` | Distinct assets on a simple background |
| `rd_fast__portrait` | Character portraits with high detail |
| `rd_fast__texture` | Flat game textures like stones, bricks, or wood |
| `rd_fast__ui` | User interface boxes and buttons |
| `rd_fast__item_sheet` | Sheets of objects on a simple background |
| `rd_fast__character_turnaround` | Character sprites from different angles |
| `rd_fast__1_bit` | Two color black and white only |
| `rd_fast__low_res` | General low resolution pixel art |
| `rd_fast__mc_item` | Minecraft-styled items with automatic transparency |
| `rd_fast__mc_texture` | Minecraft-styled flat textures like grass, stones, wood |
| `rd_fast__no_style` | Pixel art with no style influence applied |

**Animation:** `animation__four_angle_walking` — generates walking sprite sheets with four angles. **Note:** Via API, this style produces single walking poses rather than full sprite sheets. Full animation generation may require the web interface.

**RD Plus styles:**

| Style | Description |
|-------|-------------|
| `rd_plus__default` | Clean pixel art with bold colors and outlines |
| `rd_plus__retro` | Classic style inspired by PC98 games |
| `rd_plus__watercolor` | Pixel art mixed with watercolor painting aesthetic |
| `rd_plus__textured` | Semi-realistic with lots of shading and texture |
| `rd_plus__cartoon` | Simple shapes and shading with bold outlines |
| `rd_plus__classic` | Medium-resolution with strong outlines, simple shading, clear design |
| `rd_plus__low_res` | High quality, low resolution assets and backgrounds |
| `rd_plus__ui_element` | User interface boxes and buttons |
| `rd_plus__item_sheet` | Sheets of objects on a simple background |
| `rd_plus__skill_icon` | Video game style skill icons for abilities |
| `rd_plus__character_turnaround` | Character sprites from different angles |
| `rd_plus__environment` | One-point perspective scenes with outlines and strong shapes |
| `rd_plus__isometric` | 45° isometric perspective with consistent outlines |
| `rd_plus__isometric_asset` | 45° isometric objects on neutral background |
| `rd_plus__topdown_map` | Video game map with 3/4 top-down perspective |
| `rd_plus__topdown_asset` | 3/4 top-down game assets on simple background |
| `rd_plus__topdown_item` | Small 3/4 top-down assets with no background |
| `rd_plus__mc_item` | Minecraft-styled items and game assets |
| `rd_plus__mc_texture` | Minecraft-style flat block textures, enhanced prompt following |

**Size ranges:**
- Most styles: 64x64 → 512x512
- MC styles: 16x16 → 128x128
- Animation style: 48x48 only
