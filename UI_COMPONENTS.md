# UI Components

This document specifies all UI components used in TCFU.

---

## Buttons

| State | Background | Text Color | Padding |
|-------|------------|------------|---------|
| Default | `#333333` | `#ffffff` | 20px × 10px (large) |
| Hover | `#555555` | `#ffffff` | 20px × 10px (large) |
| Danger | `#333333` | `#ff6666` | 10px × 5px (small) |

- Interactive buttons show hand cursor on hover
- Use `setInteractive({ useHandCursor: true })`

---

## HUD Layout

```
┌─────────────────────────────────────────┐
│ Lives: 3      Wave 1         Score: 0   │
│ ← left        center          right →   │
└─────────────────────────────────────────┘
Position: 20px from top
```

| Element | X Position | Alignment | Style |
|---------|------------|-----------|-------|
| Lives | 20px | Left | 16px white |
| Wave | 180px (center) | Center | 16px white |
| Score | 340px | Right | 16px white |

---

## Overlay States

### Pause Screen

- Title: "PAUSED" (32px white, centered)
- Hint: "P - Resume   M - Main Menu" (14px white)

### Game Over Screen

- Title: "GAME OVER" (32px red, centered)
- High score indicator: "NEW HIGH SCORE!" (18px yellow, if applicable)
- Score display: "High Score: [N]" (16px white)
- Controls: "R - Restart   M - Main Menu" (14px white)

---

## Wave Announcement

Displayed when starting Wave 2+:

```
Text: "WAVE [N]"
Size: 48px
Color: Yellow (#ffff00)
Position: Center screen

Animation:
  - Scale: 0.5 → 1.2
  - Alpha: 0 → 1
  - Duration: 300ms
  - Ease: Power2
  - Yoyo: true
  - Hold: 500ms
```
