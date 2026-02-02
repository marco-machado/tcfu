# Game Architecture

## Entry Point & Config

- `src/main.ts` → `src/game/main.ts` initializes Phaser game
- Game canvas: 360x640 pixels, pixel art mode, arcade physics (no gravity)
- All gameplay constants centralized in `config/GameConfig.ts`

## Scene Flow

Four-scene system:

1. **BootScene**: Loading screen with space background and progress bar, loads assets via JSON pack files (`public/assets/data/assets.json`, `animations.json`), dynamically creates all Phaser animations
2. **MainMenuScene**: Title screen with START button, CLEAR DATA button, displays high score, scrolling background
3. **GameScene**: Main gameplay - spawns entities, manages systems, handles collisions, pause/bomb controls
4. **UIScene**: HUD overlay launched alongside GameScene with multiple display sections

## Input System

- **InputManager** (`input/InputManager.ts`): Unified input handling for keyboard and touch, provides `getCursorState()` returning directional + space input from either source
- **TouchControlsSystem** (`systems/TouchControlsSystem.ts`): Mobile touch controls with drag-to-move player, double-tap to fire, pause/bomb buttons
- Touch configuration in `TOUCH_CONTROLS_CONFIG` (GameConfig.ts): button positions, double-tap threshold, visual style

## Game Controls

### Keyboard

| Key | Action |
|-----|--------|
| Arrow Keys | Move player |
| Space | Fire weapon |
| P / ESC | Pause/Resume game |
| B | Activate bomb (clears screen) |
| R | Restart (game over screen) |
| M | Main menu (pause/game over) |

### Touch (mobile)

| Gesture | Action |
|---------|--------|
| Drag anywhere | Move player (follows touch offset) |
| Double-tap | Fire weapon |
| Pause button (top-right) | Pause/Resume game |
| Left button (bottom-left) | Activate bomb |
| Right button (bottom-right) | Fire weapon |

Debug keys (when `GAME_CONFIG.debug = true`): Keys 1-0 spawn specific powerups for testing

## Asset Pipeline

- Images in `public/assets/images/`
- Spritesheets configured in `public/assets/data/assets.json` (frameWidth/frameHeight)
- Animations defined in `public/assets/data/animations.json` (key, frames, frameRate, repeat)
- Asset keys use kebab-case

## Utilities

- **HighScoreManager** (`utils/HighScoreManager.ts`): LocalStorage persistence for high scores
