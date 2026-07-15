import { describe, expect, it } from 'vitest'
import {
  canActivate,
  keyToIntent,
  nextIndex,
  padIntents,
  readPads,
  resolveBack,
  NEUTRAL_PAD_SNAPSHOT,
  type MenuIntent,
  type PadSnapshot,
} from './policy'

describe('nextIndex', () => {
  it('advances and wraps forward past the last item', () => {
    expect(nextIndex(0, 1, 4)).toBe(1)
    expect(nextIndex(3, 1, 4)).toBe(0)
  })

  it('retreats and wraps backward past the first item', () => {
    expect(nextIndex(2, -1, 4)).toBe(1)
    expect(nextIndex(0, -1, 4)).toBe(3)
  })

  it('enters the ring from an unfocused state', () => {
    expect(nextIndex(-1, 1, 4)).toBe(0)
    expect(nextIndex(-1, -1, 4)).toBe(3)
  })

  it('stays put on a single-item ring', () => {
    expect(nextIndex(0, 1, 1)).toBe(0)
    expect(nextIndex(0, -1, 1)).toBe(0)
  })

  it('returns -1 for an empty ring', () => {
    expect(nextIndex(0, 1, 0)).toBe(-1)
  })
})

describe('canActivate', () => {
  it('activates an enabled control', () => {
    expect(canActivate({ disabled: false })).toBe(true)
    expect(canActivate({})).toBe(true)
  })

  it('refuses a disabled or missing control', () => {
    expect(canActivate({ disabled: true })).toBe(false)
    expect(canActivate(null)).toBe(false)
    expect(canActivate(undefined)).toBe(false)
  })
})

describe('resolveBack', () => {
  it('cancels arming before leaving when a destructive action is armed', () => {
    expect(resolveBack(true)).toBe('cancel-arming')
  })

  it('leaves the screen when nothing is armed', () => {
    expect(resolveBack(false)).toBe('leave')
  })
})

describe('keyToIntent', () => {
  it('maps Tab to forward and Shift+Tab to backward movement', () => {
    expect(keyToIntent('Tab', false)).toEqual({ kind: 'move', delta: 1 })
    expect(keyToIntent('Tab', true)).toEqual({ kind: 'move', delta: -1 })
  })

  it('maps vertical arrows to ring movement', () => {
    expect(keyToIntent('ArrowDown', false)).toEqual({ kind: 'move', delta: 1 })
    expect(keyToIntent('ArrowUp', false)).toEqual({ kind: 'move', delta: -1 })
  })

  it('maps horizontal arrows to value adjustment', () => {
    expect(keyToIntent('ArrowRight', false)).toEqual({ kind: 'adjust', delta: 1 })
    expect(keyToIntent('ArrowLeft', false)).toEqual({ kind: 'adjust', delta: -1 })
  })

  it('maps Enter and Space to activate, Escape to back', () => {
    expect(keyToIntent('Enter', false)).toEqual({ kind: 'activate' })
    expect(keyToIntent('Space', false)).toEqual({ kind: 'activate' })
    expect(keyToIntent('Escape', false)).toEqual({ kind: 'back' })
  })

  it('ignores unmapped keys', () => {
    expect(keyToIntent('KeyA', false)).toBeNull()
    expect(keyToIntent('Digit1', false)).toBeNull()
  })
})

function pad(overrides: {
  buttons?: Record<number, boolean>
  axes?: number[]
}): Gamepad {
  const buttons = Array.from({ length: 17 }, (_, i) => ({
    pressed: overrides.buttons?.[i] ?? false,
    touched: false,
    value: overrides.buttons?.[i] ? 1 : 0,
  }))
  return { buttons, axes: overrides.axes ?? [0, 0] } as unknown as Gamepad
}

describe('readPads', () => {
  it('reads d-pad buttons into directional flags', () => {
    expect(readPads([pad({ buttons: { 12: true } })]).up).toBe(true)
    expect(readPads([pad({ buttons: { 13: true } })]).down).toBe(true)
    expect(readPads([pad({ buttons: { 14: true } })]).left).toBe(true)
    expect(readPads([pad({ buttons: { 15: true } })]).right).toBe(true)
  })

  it('reads the left stick past the threshold as direction', () => {
    expect(readPads([pad({ axes: [0, -0.9] })]).up).toBe(true)
    expect(readPads([pad({ axes: [0, 0.9] })]).down).toBe(true)
    expect(readPads([pad({ axes: [-0.9, 0] })]).left).toBe(true)
    expect(readPads([pad({ axes: [0.9, 0] })]).right).toBe(true)
  })

  it('ignores stick drift under the threshold', () => {
    expect(readPads([pad({ axes: [0.4, -0.4] })])).toEqual(NEUTRAL_PAD_SNAPSHOT)
  })

  it('reads accept and back buttons', () => {
    expect(readPads([pad({ buttons: { 0: true } })]).accept).toBe(true)
    expect(readPads([pad({ buttons: { 1: true } })]).back).toBe(true)
  })

  it('merges multiple pads and skips null slots', () => {
    const snap = readPads([null, pad({ buttons: { 0: true } }), pad({ buttons: { 13: true } })])
    expect(snap.accept).toBe(true)
    expect(snap.down).toBe(true)
  })
})

const NEUTRAL = NEUTRAL_PAD_SNAPSHOT
function snap(overrides: Partial<PadSnapshot>): PadSnapshot {
  return { ...NEUTRAL, ...overrides }
}

describe('padIntents', () => {
  it('emits nothing when the snapshot is unchanged (held buttons do not repeat)', () => {
    const held = snap({ down: true })
    expect(padIntents(held, held, false).intents).toEqual([])
  })

  it('emits directional moves on the press edge only', () => {
    expect(padIntents(NEUTRAL, snap({ up: true }), false).intents).toEqual<MenuIntent[]>([
      { kind: 'move', delta: -1 },
    ])
    expect(padIntents(NEUTRAL, snap({ down: true }), false).intents).toEqual<MenuIntent[]>([
      { kind: 'move', delta: 1 },
    ])
  })

  it('emits value adjustment on the horizontal press edge', () => {
    expect(padIntents(NEUTRAL, snap({ left: true }), false).intents).toEqual<MenuIntent[]>([
      { kind: 'adjust', delta: -1 },
    ])
    expect(padIntents(NEUTRAL, snap({ right: true }), false).intents).toEqual<MenuIntent[]>([
      { kind: 'adjust', delta: 1 },
    ])
  })

  it('arms accept on press but does not activate until release', () => {
    const pressed = padIntents(NEUTRAL, snap({ accept: true }), false)
    expect(pressed.intents).toEqual([])
    expect(pressed.acceptArmed).toBe(true)

    const released = padIntents(snap({ accept: true }), NEUTRAL, pressed.acceptArmed)
    expect(released.intents).toEqual<MenuIntent[]>([{ kind: 'activate' }])
    expect(released.acceptArmed).toBe(false)
  })

  it('does not activate on a release that was never armed inside the menu', () => {
    // Accept was already held on entry (prev held, seeded armed=false): releasing
    // it must not fire, preventing hold-through from gameplay.
    const released = padIntents(snap({ accept: true }), NEUTRAL, false)
    expect(released.intents).toEqual([])
    expect(released.acceptArmed).toBe(false)
  })

  it('emits back on the press edge', () => {
    expect(padIntents(NEUTRAL, snap({ back: true }), false).intents).toEqual<MenuIntent[]>([
      { kind: 'back' },
    ])
  })
})
