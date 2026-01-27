# UI Components

This document specifies all UI components used in TCFU.

---

## Buttons

| State | Background | Text Color | Padding |
|-------|------------|------------|---------|
| Default | `#333333` | `#ffffff` | 20px x 10px (large) |
| Hover | `#555555` | `#ffffff` | 20px x 10px (large) |
| Danger | `#333333` | `#ff6666` | 10px x 5px (small) |

- Interactive buttons show hand cursor on hover
- Use `setInteractive({ useHandCursor: true })`

---

## HUD Layout

### Top Row (Primary Stats)

```
+-------------------------------------------+
| Lives: 3      Wave 1         Score: 0     |
| <- left       center          right ->    |
+-------------------------------------------+
Position: 20px from top
```

| Element | X Position | Alignment | Style |
|---------|------------|-----------|-------|
| Lives | 20px | Left | 16px white |
| Wave | 180px (center) | Center | 16px white |
| Score | 340px | Right | 16px white |

### Second Row (Powerup Status)

```
+-------------------------------------------+
| BOM: ###   DMG: ###   FR: ####   SPD: ### |
+-------------------------------------------+
Position: 40px from top
```

| Element | Description | Max Indicators |
|---------|-------------|----------------|
| BOM | Bomb count (filled/empty circles) | 3 |
| DMG | Damage powerup stacks | 3 |
| FR | Fire rate powerup stacks | 4 |
| SPD | Speed powerup stacks | 3 |

**Indicator Style:**
- Filled circle (active): White text
- Empty circle (inactive): Gray text
- Format: `BOM: ###` where # is filled/empty indicator

---

## Timed Effects Display

Located at bottom of screen, shows active timed powerups with progress bars.

```
+-------------------------------------------+
|                                           |
|  [INV ========    ] [SHLD ======      ]   |
|                                           |
+-------------------------------------------+
Position: Bottom of screen, centered horizontally
```

### Effect Bar Specifications

| Property | Value |
|----------|-------|
| Bar Width | 60px |
| Bar Height | 8px |
| Background | `#333333` |
| Spacing | 10px between bars |

### Effect Colors

| Effect | Short Name | Bar Color |
|--------|------------|-----------|
| Invincibility | INV | `#ffff00` (Yellow) |
| Shield | SHLD | `#00ffff` (Cyan) |
| Magnet | MAG | `#ff00ff` (Magenta) |
| Score Multiplier | 2X | `#00ff00` (Green) |

### Behavior
- Bars animate smoothly as duration depletes
- Effects appear/disappear dynamically
- Multiple effects reposition horizontally to stay centered

---

## Announcements

### Wave Announcement

Displayed when starting Wave 2+:

```
Text: "WAVE [N]"
Size: 48px
Color: Yellow (#ffff00)
Position: Center screen

Animation:
  - Scale: 0.5 -> 1.2
  - Alpha: 0 -> 1
  - Duration: 300ms
  - Ease: Power2
  - Yoyo: true
  - Hold: 500ms
```

### Powerup Collected Announcement

Displayed when collecting a powerup:

```
Text: "+1 [POWERUP NAME]" or "[EFFECT] ACTIVATED"
Size: 20px
Color: Yellow (#ffff00) base, varies by type
Position: Center screen, stacked if multiple

Animation:
  - Alpha fade in/out
  - Duration: 1500ms total
```

**Powerup Announcement Examples:**
- `+1 BOMB`
- `+1 LIFE`
- `FIRE RATE UP`
- `SHIELD ACTIVATED`
- `2X SCORE!`

### Shield Absorbed Announcement

```
Text: "SHIELD BLOCKED!"
Size: 24px
Color: Cyan (#00ffff)
Position: Center screen

Animation:
  - Scale: 1.0 -> 1.3
  - Duration: 200ms
  - Ease: Power2
```

---

## Overlay States

### Pause Screen

```
+-------------------------------------------+
|                                           |
|               PAUSED                      |
|                                           |
|      P - Resume   M - Main Menu           |
|              B - Bomb                     |
|                                           |
|      [Debug keys if debug enabled]        |
|                                           |
+-------------------------------------------+
```

| Element | Style |
|---------|-------|
| Title | 32px white, centered |
| Controls hint | 14px white |
| Bomb hint | 14px white |
| Debug keys | 12px gray (only in debug mode) |

**Debug Keys Reference (shown when `GAME_CONFIG.debug = true`):**
```
1-FireRate 2-Damage 3-Spread 4-Speed 5-Life
6-Bomb 7-Invincibility 8-Shield 9-Magnet 0-2xScore
```

### Game Over Screen

```
+-------------------------------------------+
|                                           |
|             GAME OVER                     |
|                                           |
|          NEW HIGH SCORE!                  |
|          High Score: 12500                |
|                                           |
|      R - Restart   M - Main Menu          |
|                                           |
+-------------------------------------------+
```

| Element | Style | Condition |
|---------|-------|-----------|
| Title | 32px red (`#ff0000`), centered | Always |
| High score indicator | 18px yellow (`#ffff00`) | Only if new high score |
| Score display | 16px white | Always |
| Controls hint | 14px white | Always |

---

## Loading Screen (BootScene)

```
+-------------------------------------------+
|                                           |
|          [Space Background]               |
|                                           |
|         [======progress======]            |
|                                           |
+-------------------------------------------+
```

| Element | Style |
|---------|-------|
| Background | Space background image |
| Progress bar | 200x10px, centered |
| Bar background | `#222222` |
| Bar fill | `#ffffff` |

---

## Main Menu

```
+-------------------------------------------+
|                                           |
|          [TITLE LOGO]                     |
|                                           |
|          High Score: 12500                |
|                                           |
|           [ START ]                       |
|                                           |
|          [CLEAR DATA]                     |
|                                           |
+-------------------------------------------+
```

| Element | Position | Style |
|---------|----------|-------|
| Title logo | 1/3 from top, centered | Logo image |
| High score | Below logo | 16px yellow |
| START button | Center | Large button style |
| CLEAR DATA | Below START | Small danger button style |
| Background | Full screen | Scrolling space (speed: 1) |
