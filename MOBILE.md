# Mobile Support Implementation Plan for TCFU

## Overview
Add touch controls to the space shooter. The game already has mobile-friendly scaling (Scale.FIT, CENTER_BOTH, 360x640 portrait canvas). This plan supports multiple control schemes that players can choose from.

---

## Control Scheme Options

### Option A: Virtual Joystick + Fire Button (Default)
Classic dual-stick style. Left joystick for movement, right button for shooting.

```
+----------------------------------+
|  Lives      Wave 1      Score    |
|  BOM DMG FR SPD          [PAUSE] |
|                                  |
|          GAMEPLAY AREA           |
|                                  |
|                           [BOMB] |
|   [JOYSTICK]             [FIRE]  |
+----------------------------------+
```

**Pros:** Familiar to mobile gamers, precise control
**Cons:** UI elements visible on screen

---

### Option B: Direct Drag + Auto-Fire
Touch and drag the ship directly. Ship fires automatically.

```
+----------------------------------+
|  Lives      Wave 1      Score    |
|  BOM DMG FR SPD          [PAUSE] |
|                                  |
|          GAMEPLAY AREA           |
|              ✈️ <- drag ship      |
|                           [BOMB] |
|      (auto-fire enabled)         |
+----------------------------------+
```

**Pros:** Simplest controls, intuitive
**Cons:** Finger obscures ship, auto-fire removes skill element

---

### Option C: Relative Touch + Fire Button
Touch anywhere on left side, ship moves relative to finger movement (Brawl Stars style).

```
+----------------------------------+
|  Lives      Wave 1      Score    |
|  BOM DMG FR SPD          [PAUSE] |
|                                  |
|   RELATIVE    |    GAMEPLAY      |
|   TOUCH ZONE  |      AREA        |
|   (movement)  |           [BOMB] |
|               |           [FIRE] |
+----------------------------------+
```

**Pros:** Finger doesn't obscure ship, works anywhere in zone
**Cons:** Slightly less intuitive initially

---

### Option D: Tilt Controls + Tap to Fire
Use device accelerometer for movement. Tap anywhere to fire.

**Pros:** Immersive, unique feel, screen unobstructed
**Cons:** Requires real device, can be fatiguing, less precise

---

### Option E: Invisible Touch Zones
Split screen into invisible zones. No visible controls.

```
+----------------------------------+
|  Lives      Wave 1      Score    |
|  BOM DMG FR SPD          [PAUSE] |
|                 |                |
|    MOVEMENT     |    FIRE        |
|    ZONE         |    ZONE        |
|    (drag)       |    (tap/hold)  |
|                 |         [BOMB] |
+----------------------------------+
```

**Pros:** Clean UI, large touch targets
**Cons:** Not discoverable, needs tutorial

---

## Recommended Implementation

**Phase 1:** Implement Option A (Virtual Joystick) as default
**Phase 2:** Add Option B (Direct Drag + Auto-Fire) as alternative
**Phase 3:** Add settings menu to switch between control schemes

---

## Visual Layout (Option A - Default)

```
+----------------------------------+
|  Lives      Wave 1      Score    |  <- Existing HUD
|  BOM DMG FR SPD                  |
|                          [PAUSE] |  <- Mobile pause button (40px)
|                                  |
|          GAMEPLAY AREA           |
|                                  |
|                           [BOMB] |  <- Bomb button (56px)
|   [JOYSTICK]             [FIRE]  |  <- Joystick (96px) + Fire (64px)
+----------------------------------+
```

---

## Implementation Steps

### Phase 1: Setup
1. Install Rex plugin: `npm install phaser3-rex-plugins`
2. Add `TOUCH_CONTROLS_CONFIG` to `src/game/config/GameConfig.ts`

Note: Using Phaser's built-in Graphics to draw touch controls (circles, rectangles) - no PNG assets needed.

### Phase 2: Input Abstraction
3. Create `src/game/input/InputManager.ts` - unified interface for keyboard + touch
4. Modify `src/game/entities/Player.ts` to accept InputManager
5. Update `src/game/scenes/GameScene.ts` to create and inject InputManager
6. Test keyboard controls still work

### Phase 3: Touch Controls System (Option A)
7. Enable touch in `src/game/main.ts`: `touch: true`
8. Create `src/game/systems/TouchControlsSystem.ts`:
    - Virtual joystick (left side, 8-direction)
    - Fire button (right side, continuous while held)
    - Bomb button (above fire)
    - Pause button (top right)
9. Integrate TouchControlsSystem in GameScene
10. Only show controls on touch-capable devices (`this.sys.game.device.input.touch`)

### Phase 4: Alternative Controls (Option B)
11. Add `DirectDragControls` mode to TouchControlsSystem
12. Implement auto-fire toggle in PlayerWeaponsSystem
13. Add control scheme setting to GameConfig

### Phase 5: Polish
14. Add touch-friendly restart/menu buttons in UIScene game over screen
15. Add control scheme selector in MainMenuScene (for mobile)
16. Fine-tune control positions and opacity
17. Test on mobile device/emulator

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/game/input/InputManager.ts` | Unified keyboard/touch input interface |
| `src/game/systems/TouchControlsSystem.ts` | Virtual joystick and touch buttons (using Phaser Graphics) |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/game/main.ts` | Enable touch input (`touch: true`) |
| `src/game/entities/Player.ts` | Accept InputManager, use getCursorKeys(), add draggable mode |
| `src/game/scenes/GameScene.ts` | Create InputManager & TouchControlsSystem |
| `src/game/scenes/MainMenuScene.ts` | Add control scheme selector for mobile |
| `src/game/scenes/UIScene.ts` | Add touch-friendly game over buttons |
| `src/game/config/GameConfig.ts` | Add TOUCH_CONTROLS_CONFIG |
| `src/game/systems/PlayerWeaponsSystem.ts` | Add auto-fire mode support |

---

## Key Implementation Details

### InputManager Interface
```typescript
export interface ICursorKeys {
    left: { isDown: boolean }
    right: { isDown: boolean }
    up: { isDown: boolean }
    down: { isDown: boolean }
    space: { isDown: boolean }
}

export enum ControlScheme {
    JOYSTICK = 'joystick',
    DIRECT_DRAG = 'direct_drag',
    RELATIVE_TOUCH = 'relative_touch',
    TILT = 'tilt'
}
```
Merges keyboard and touch input so Player code remains clean.

### TouchControlsSystem
- Uses Rex VirtualJoystick with `createCursorKeys()` for joystick mode
- Joystick base/thumb drawn with Phaser Graphics (semi-transparent circles)
- Fire/Bomb/Pause buttons drawn with Graphics (circles with text labels)
- Fire button uses pointerdown/pointerup events to toggle `touchFirePressed`
- All controls have `setScrollFactor(0)` to stay fixed on screen
- Controls disabled during pause, re-enabled on resume
- Supports multiple control schemes via configuration

### Direct Drag Mode
```typescript
player.setInteractive({ draggable: true })
  .on('drag', (pointer, dragX, dragY) => {
    player.setPosition(dragX, dragY)
  })
```

### Tilt Controls (Optional)
```typescript
window.addEventListener('deviceorientation', (e) => {
  const tiltX = e.gamma // Left/right tilt (-90 to 90)
  const tiltY = e.beta  // Front/back tilt (-180 to 180)
  // Map to player velocity
})
```

### Configuration (GameConfig.ts)
```typescript
export const TOUCH_CONTROLS_CONFIG = {
    defaultScheme: ControlScheme.JOYSTICK,
    autoFire: false,
    joystick: { x: 70, y: 560, radius: 50, alpha: 0.6 },
    fireButton: { x: 310, y: 570, size: 64, alpha: 0.7 },
    bombButton: { x: 310, y: 490, size: 56, alpha: 0.7 },
    pauseButton: { x: 330, y: 70, size: 40, alpha: 0.6 },
    relativeTouchZone: { x: 0, y: 0, width: 180, height: 640 },
    tiltSensitivity: 2.0,
}
```

---

## Control Scheme Comparison

| Scheme | Movement | Shooting | Complexity | Best For |
|--------|----------|----------|------------|----------|
| **Joystick** | Virtual stick | Manual button | Medium | Precision, hardcore |
| **Direct Drag** | Drag ship | Auto-fire | Simple | Casual players |
| **Relative Touch** | Relative drag | Manual button | Medium | Experienced mobile |
| **Tilt** | Accelerometer | Tap anywhere | Complex | Immersive play |
| **Touch Zones** | Left half drag | Right half tap | Simple | Clean UI |

---

## Verification

1. Run `npm run dev` and test on desktop - keyboard controls still work
2. Open Chrome DevTools, enable touch simulation - touch controls appear
3. Test joystick moves player in all 8 directions
4. Test fire button triggers continuous shooting while held
5. Test bomb and pause buttons work
6. Test direct drag mode moves ship correctly
7. Test auto-fire mode (if enabled)
8. Test game over screen has touch-friendly restart/menu buttons
9. Test control scheme switching (if implemented)
10. Run `npm run typecheck` and `npm run lint` - no errors

---

## Sources

- [Rex Virtual Joystick Plugin](https://rexrainbow.github.io/phaser3-rex-notes/docs/site/virtualjoystick/)
- [Rex Gestures - Swipe](https://rexrainbow.github.io/phaser3-rex-notes/docs/site/gesture-swipe/)
- [Phaser 3 Touch Input](https://docs.phaser.io/api-documentation/namespace/input-events)
- [MDN: Mobile Touch Controls](https://developer.mozilla.org/en-US/docs/Games/Techniques/Control_mechanisms/Mobile_touch)
- [Touch Control Design: Less Is More](https://mobilefreetoplay.com/touch-control-design-less-is-more/)
- [How to Make Mobile Shooting Controls Fun](https://adroittechstudios.com/how-to-make-mobile-shooting-controls-fun/)
- [Mobile Accelerometer Input](https://www.inkfood.com/mobile-accelerometer-input/)
