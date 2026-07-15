// Pure decision core for the shared menu-focus owner (ADR 0008). Keyboard and
// gamepad adapters both translate raw input into these logical intents, so ring
// movement, activation eligibility, and back phases stay testable without a DOM.

export type MenuIntent =
  | { kind: 'move'; delta: -1 | 1 }
  | { kind: 'adjust'; delta: -1 | 1 }
  | { kind: 'activate' }
  | { kind: 'back' }

/**
 * Move an index by `delta` around a ring of `count` focusables, wrapping at both
 * ends. A negative `current` (nothing focused) enters the ring at the first item
 * moving forward, or the last item moving backward.
 */
export function nextIndex(current: number, delta: number, count: number): number {
  if (count <= 0) return -1
  if (current < 0) return delta > 0 ? 0 : count - 1
  return (((current + delta) % count) + count) % count
}

/** A focused control activates only when present and enabled. */
export function canActivate(item: { disabled?: boolean } | null | undefined): boolean {
  return !!item && !item.disabled
}

/** Two-phase back: clear a pending destructive arming first, otherwise leave. */
export type BackPhase = 'cancel-arming' | 'leave'
export function resolveBack(hasArming: boolean): BackPhase {
  return hasArming ? 'cancel-arming' : 'leave'
}

export function keyToIntent(code: string, shiftKey: boolean): MenuIntent | null {
  switch (code) {
    case 'Tab':
      return { kind: 'move', delta: shiftKey ? -1 : 1 }
    case 'ArrowDown':
      return { kind: 'move', delta: 1 }
    case 'ArrowUp':
      return { kind: 'move', delta: -1 }
    case 'ArrowRight':
      return { kind: 'adjust', delta: 1 }
    case 'ArrowLeft':
      return { kind: 'adjust', delta: -1 }
    case 'Enter':
    case 'Space':
      return { kind: 'activate' }
    case 'Escape':
      return { kind: 'back' }
    default:
      return null
  }
}

export type PadSnapshot = {
  up: boolean
  down: boolean
  left: boolean
  right: boolean
  accept: boolean
  back: boolean
}

export const PAD_AXIS_THRESHOLD = 0.5

const D_PAD_UP = 12
const D_PAD_DOWN = 13
const D_PAD_LEFT = 14
const D_PAD_RIGHT = 15
const BUTTON_ACCEPT = 0
const BUTTON_BACK = 1

/** Collapse all connected pads into one directional/action snapshot. */
export function readPads(pads: readonly (Gamepad | null)[]): PadSnapshot {
  const snap: PadSnapshot = {
    up: false,
    down: false,
    left: false,
    right: false,
    accept: false,
    back: false,
  }
  for (const pad of pads) {
    if (!pad) continue
    const axisX = pad.axes[0] ?? 0
    const axisY = pad.axes[1] ?? 0
    if (pad.buttons[D_PAD_UP]?.pressed || axisY < -PAD_AXIS_THRESHOLD) snap.up = true
    if (pad.buttons[D_PAD_DOWN]?.pressed || axisY > PAD_AXIS_THRESHOLD) snap.down = true
    if (pad.buttons[D_PAD_LEFT]?.pressed || axisX < -PAD_AXIS_THRESHOLD) snap.left = true
    if (pad.buttons[D_PAD_RIGHT]?.pressed || axisX > PAD_AXIS_THRESHOLD) snap.right = true
    if (pad.buttons[BUTTON_ACCEPT]?.pressed) snap.accept = true
    if (pad.buttons[BUTTON_BACK]?.pressed) snap.back = true
  }
  return snap
}

/**
 * Edge-detect intents between two pad snapshots. Directional and back intents
 * fire on the press edge. Accept arms on its press edge and only fires
 * `activate` on release, so a button held across a screen boundary cannot leak
 * an activation into gameplay or a freshly opened menu.
 */
export function padIntents(
  prev: PadSnapshot,
  cur: PadSnapshot,
  acceptArmed: boolean,
): { intents: MenuIntent[]; acceptArmed: boolean } {
  const intents: MenuIntent[] = []
  if (cur.up && !prev.up) intents.push({ kind: 'move', delta: -1 })
  if (cur.down && !prev.down) intents.push({ kind: 'move', delta: 1 })
  if (cur.left && !prev.left) intents.push({ kind: 'adjust', delta: -1 })
  if (cur.right && !prev.right) intents.push({ kind: 'adjust', delta: 1 })

  let armed = acceptArmed
  if (cur.accept && !prev.accept) armed = true
  if (!cur.accept && prev.accept && armed) {
    armed = false
    intents.push({ kind: 'activate' })
  }

  if (cur.back && !prev.back) intents.push({ kind: 'back' })
  return { intents, acceptArmed: armed }
}

export const NEUTRAL_PAD_SNAPSHOT: PadSnapshot = {
  up: false,
  down: false,
  left: false,
  right: false,
  accept: false,
  back: false,
}
