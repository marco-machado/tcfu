# Retro Diffusion Core: AI-powered pixel art for game developers

**Retro Diffusion Core is a specialized AI system that generates authentic, game-ready pixel art** — solving the persistent problem that mainstream AI tools like DALL-E and Midjourney produce technically incorrect "pixelated-looking" images rather than true pixel art. Unlike generic AI generators, Retro Diffusion maintains proper grid alignment, limited color palettes, and clean edges without anti-aliasing artifacts. The platform offers multiple access points: a Poe.com chatbot, cloud-based web interface, Aseprite extension for local generation, and API access via Replicate. For game developers, this means generating sprites, tiles, animations, and UI elements that can go directly into a game engine with minimal cleanup.

## What Retro Diffusion is and how it differs from other AI tools

Retro Diffusion was created by **Cody Claus** (Astropulse LLC), a professional pixel artist with seven years of experience who identified a critical gap: existing AI image generators fundamentally misunderstand pixel art. The system is built on FLUX architecture and trained exclusively on **licensed assets from 30+ consenting pixel artists** — a notable ethical distinction from web-scraped training datasets.

The technical approach solves three core problems that plague other AI tools. First, grid alignment: Retro Diffusion maintains consistent pixel grids where each "pixel" is exactly one pixel, not varying blobs of color. Second, color discipline: outputs use intentionally limited palettes with proper dithering techniques rather than unlimited, muddy gradients. Third, edge clarity: results feature clean outlines without the anti-aliasing and partial transparency that make generic AI output unusable for games.

The platform includes **23+ specialized models** covering different use cases: RD_Fast for quick generation across 15+ styles, RD_Plus for higher-quality scenes and maps, RD_Tile for seamless textures, and RD_Animation for sprite sheet generation. Each model produces outputs at native resolutions between **16×16 and 512×512 pixels**, with optimal results at 256×256 and below where the models were trained.

## Four ways to access Retro Diffusion for game asset creation

**Poe.com chatbot (Retro Diffusion Core)** provides the quickest entry point. Create a free Poe account, navigate to poe.com/Retro-Diffusion-Core, and start generating with text prompts. The first 50 basic generations are free. Use parameters like `--ar 128:128` for dimensions, `--style rd_fast__game_asset` for style presets, and `--removebg` for transparent backgrounds.

**Retrodiffusion.ai web interface** offers the full feature set including animation generation. Sign up for 50 free credits (each standard image costs roughly 1 credit), access larger server-grade models unavailable locally, and generate animated sprite sheets. This is the only platform that supports animation generation.

**Aseprite extension** enables offline, unlimited local generation after a one-time purchase ($65 full version, $20 lite). Requirements include Python 3.11.6 specifically, an NVIDIA GTX 10xx or better GPU with 4GB+ VRAM, and 16GB system RAM. Mac users need M1/M2/M3 with 16GB+ RAM. Generation speed ranges from under 2 seconds on an RTX 3090 to 5 minutes on CPU fallback. Note that the extension uses different models than the website and cannot generate animations.

**Replicate API** allows pipeline integration for automated workflows. Models available include `retro-diffusion/rd-fast`, `retro-diffusion/rd-plus`, `retro-diffusion/rd-tile`, and `retro-diffusion/rd-animation`.

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
| `style` | string | Style preset (see available styles in Description on Poe section) |
| `seed` | string | Random seed for reproducible results |
| `width` | string | Output width in pixels (64-512, or 16-128 for MC styles) |
| `height` | string | Output height in pixels (64-512, or 16-128 for MC styles) |
| `tilex` | boolean | Enable horizontal seamless tiling |
| `tiley` | boolean | Enable vertical seamless tiling |
| `iw` | number | Image generation strength (0.0-1.0) |
| `native` | boolean | Return at native resolution without upscaling |
| `removebg` | boolean | Remove background for transparent output |

**Notes:**
- The `messages` array follows OpenAI chat format with `role` and `content` fields
- Your prompt goes in the `content` field of a user message
- Generation parameters that would normally be flags (like `--removebg`) go in `extra_body`
- API usage consumes Poe credits similar to the web interface

## Step-by-step workflow for generating game sprites and characters

Start by selecting the appropriate style preset for your asset type. For characters and game objects, use `rd_fast__game_asset` or `rd_fast__portrait`. For items and icons, use `rd_fast__item_sheet`. For environmental tiles, use `rd_fast__texture` or the dedicated RD_Tile model.

Craft prompts using **simple, natural language** — Retro Diffusion's custom CLIP model favors clear sentence structure over complex prompt engineering. The recommended format is: "detailed pixel art of [subject], pixel art style, pixel art." For example: "detailed pixel art of a knight character in medieval armor, side view, pixel art style, pixel art." Include pose direction (idle, walking, attacking), viewpoint (side view, front view, top-down), and style references (retro RPG, classic JRPG).

Apply a **negative prompt** to avoid common artifacts: "muted, dull, hazy, muddy colors, blurry, mutated, deformed, noise, stock image, borders, frame, watermark, text, signature, cropped, out of frame."

Set dimensions matching your game's requirements. For character sprites, **64×64 to 128×128** work well (64×64 is the minimum for most styles). For environment tiles, use powers of 2 matching your engine's tile size. Enable `--removebg` for transparent backgrounds on sprites that will be composited in-game. Scale down in your game engine for smaller display sizes.

For iterative refinement, use **image-to-image mode** with a rough sketch or existing sprite as reference. Adjust the strength parameter (0.0-1.0) to control how much the reference influences output — higher values like 0.8 create more distinct results while lower values stay closer to your reference.

## Asset types and optimal settings for each category

**Character sprites** work best at 32×32 to 128×128 resolution using the `game_asset` or `portrait` styles. Include pose and direction in prompts: "hero standing idle, wearing medieval outfit, colorful retro pixel-art style." Always enable background removal for game integration.

**Tilesets and textures** require the `--tile` modifier for seamless edges. Use RD_Tile model or `rd_fast__texture` style. The dual-prompt blending feature can merge two textures (stone and moss, for example) for environmental variety. Example prompt: "grass and dirt path tileset with stones and flowers, seamless texture."

**Walking animations** are generated via the website or API only, not the local extension. Use `animation__four_angle_walking` style at 48×48 resolution. The output is a sprite sheet with frames organized in a grid ready for direct import. Example: "small pirate character with parrot, walking animation, pixel art."

**UI elements** use `rd_fast__ui` or `rd_plus__ui_element` styles. Keep prompts simple and specify exact dimensions. Works well for buttons, frames, health bars, and inventory slots.

**Top-down and isometric maps** perform excellently with `rd_plus__topdown_map` or `rd_plus__isometric` styles. Example: "top-down forest path with trees and rocks, classic JRPG map." These styles output full scene compositions rather than isolated assets.

**Minecraft-specific assets** have dedicated styles: `rd_fast__mc_texture` for block textures and `rd_fast__mc_item` for inventory items. Enable tiling for seamless block faces.

## Critical tips for game development success

**Match resolutions to training data.** The models produce cleanest results at 256×256 and below. Generating at larger sizes introduces color bleed and pixel duplication. Generate at your target game resolution rather than upscaling later.

**Use palette control for asset consistency.** Upload a palette image when generating to constrain colors to your game's established palette. This ensures all assets match visually. The Palettize feature can also reduce or change colors post-generation.

**Plan for character variation, not consistency.** Retro Diffusion cannot reliably recreate the same character in different poses — each generation produces something new. Design workflows around this limitation: generate multiple variations and hand-pick favorites, or use the character turnaround style (`rd_fast__character_turnaround`) to get front/side/back views in a single generation.

**Use seeds for reproducible experimentation.** The `--seed` parameter lets you test prompt or style changes while keeping other variables constant. Find a good seed, then iterate on wording.

**Leverage the neural tools for polish.** The Aseprite extension includes Neural Pixelate (convert any image to pixel art), Neural Resize (change size while adding appropriate detail), Neural Detail (enhance simple designs), and material texture map generation for normal maps and depth information.

## Known limitations to plan around

The extension and website use entirely different models — purchasing the $65 extension does not give you access to the web platform's larger models or animation capabilities. The website models are "far too large" to run on consumer GPUs.

Character consistency remains challenging: "Models still have trouble being specifically limited to a set number of colors, or generating perfect sections of squares," according to the developer.

Hardware compatibility has gaps: AMD Radeon GPUs work on Linux only (not Windows), Mac systems require 16GB+ RAM (8GB insufficient), and RTX 50xx series support awaits PyTorch updates. User installation experiences range from "straightforward" to "multi-day troubleshooting."

## Description on Poe

Generate true game ready pixel art in seconds at any resolution between 64x64 and 512x512 across the various styles (MC styles support 16x16-128x128). Create 48x48 walking animations of sprites using the "animation_four_angle_walking" style!

Example message: "A cute corgi wearing sunglasses and a party hat --ar 128:128 --style rd_fast__portrait"

Settings:
--ar <width>:<height> (Image size in pixels, larger images cost more. Or aspect ratio like 16:9)
--style <style_name> (The name of the style you want to use. Available styles: rd_fast__anime, rd_fast__retro, rd_fast__simple, rd_fast__detailed, rd_fast__game_asset, rd_fast__portrait, rd_fast__texture, rd_fast__ui, rd_fast__item_sheet, rd_fast__mc_texture, rd_fast__mc_item, rd_fast__character_turnaround, rd_fast__1_bit, animation__four_angle_walking, rd_plus__default, rd_plus__retro, rd_plus__watercolor, rd_plus__textured, rd_plus__cartoon, rd_plus__ui_element, rd_plus__item_sheet, rd_plus__character_turnaround, rd_plus__isometric, rd_plus__isometric_asset, rd_plus__topdown_map, rd_plus__top_down_asset)
--seed (Random number, keep the same for consistent generations)
--tile (Creates seamless edges on applicable images)
--tilex (Seamless horizontally only)
--tiley (Seamless vertically only)
--native (Returns pixel art at native resolution, without upscaling)
--removebg (Automatically remove the background)
--iw <decimal between 0.0 and 1.0> (Controls how strong the image generation is. 0.0 for small changes, 1.0 for big changes)

Additional notes: All styles have a size range of 64x64 -> 512x512, except for the "mc" styles, which have a size range of 16x16 -> 128x128, and the "animation_four_angle_walking" style, which will only create 48x48 animations.

## Conclusion

Retro Diffusion Core represents the most mature specialized solution for AI-generated pixel art, solving the grid alignment and color palette problems that make generic AI output unusable for games. The key insight for game developers is choosing the right access method: the web interface for animations and highest quality, the Aseprite extension for unlimited local generation and tight editor integration, or the API for automated pipelines. Generate at native resolutions (256×256 and below), use palette control for asset consistency, and plan workflows around the character variation limitation rather than fighting it. At roughly $0.01 per web image or $65 for unlimited local generation, the economics favor rapid iteration — generate many variations, curate the best, and apply minimal touch-up rather than trying to perfect prompts for single-shot results.
