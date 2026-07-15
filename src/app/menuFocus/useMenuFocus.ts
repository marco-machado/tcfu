import { useEffect, useRef, type RefObject } from 'react'
import { useSessionStore } from '../sessionStore'
import { playSfx } from '../../audio/bus'
import {
  keyToIntent,
  nextIndex,
  padIntents,
  readPads,
  resolveBack,
  type MenuIntent,
  type PadSnapshot,
} from './policy'

// One shared menu-focus owner for all non-combat UI (ADR 0008). Screens declare
// a focus root, mark their primary action, and provide back behavior; the owner
// handles the DOM-order ring, initial focus, keyboard + gamepad input, and the
// ui_move tick. Value editing (Left/Right on a Segmented/Toggle/Slider) is owned
// by the focused control itself, so the owner passes those intents through.

const FOCUS_STOP_SELECTOR = 'button, input[type="range"], [role="radiogroup"]'

/** DOM-order focus stops under the root; a radiogroup counts once, not per option. */
function collectStops(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUS_STOP_SELECTOR)).filter((el) => {
    const group = el.closest('[role="radiogroup"]')
    return !group || group === el
  })
}

function isActivatable(el: Element | null): el is HTMLElement {
  if (!(el instanceof HTMLElement)) return false
  if (el instanceof HTMLButtonElement && el.disabled) return false
  if (el.getAttribute('aria-disabled') === 'true') return false
  return true
}

// Set a controlled range's value through React's own value tracker, then fire an
// input event so the bound onChange runs. Used for gamepad Left/Right, which has
// no native key event to drive the range.
function nudgeRange(el: HTMLInputElement, delta: number): void {
  const step = Number(el.step) || 1
  const min = Number(el.min) || 0
  const max = Number(el.max) || 100
  const next = Math.max(min, Math.min(max, Number(el.value) + delta * step))
  if (next === Number(el.value)) return
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
  setter?.call(el, String(next))
  el.dispatchEvent(new Event('input', { bubbles: true }))
}

export type MenuFocusOptions = {
  rootRef: RefObject<HTMLElement | null>
  /** Escape / gamepad B when nothing is armed. */
  onBack?: () => void
  /** Pause: whether a destructive action is currently armed for confirmation. */
  isArmed?: () => boolean
  /** Pause: clear a pending destructive arming (the first back phase). */
  onCancelArming?: () => void
  /**
   * Bind Escape to `back`. Default true. Pause sets this false so Esc/P stay on
   * the run-input resume path (SimDriver toggles pause on that edge); binding it
   * here too would double-toggle. Gamepad B still routes through `back`.
   */
  bindBackKey?: boolean
  /** Owner is inert while false (e.g. the run overlay is hidden). */
  active?: boolean
}

export function useMenuFocus(options: MenuFocusOptions): void {
  const { rootRef, active = true, bindBackKey = true } = options
  const latest = useRef(options)
  latest.current = options

  useEffect(() => {
    if (!active) return
    const root = rootRef.current
    if (!root) return

    const settings = () => useSessionStore.getState().settings
    const stops = () => collectStops(root)

    const focusPrimary = () => {
      const primary = root.querySelector<HTMLElement>('[data-menu-primary]')
      ;(primary ?? stops()[0])?.focus()
    }
    focusPrimary()

    const move = (delta: number) => {
      const items = stops()
      if (items.length === 0) return
      const current = items.indexOf(document.activeElement as HTMLElement)
      const next = items[nextIndex(current, delta, items.length)]
      if (!next) return
      next.focus()
      playSfx('ui_move', settings())
    }

    const activate = () => {
      const el = document.activeElement
      if (isActivatable(el) && stops().includes(el)) el.click()
    }

    const back = () => {
      const armed = latest.current.isArmed?.() ?? false
      if (resolveBack(armed) === 'cancel-arming') latest.current.onCancelArming?.()
      else latest.current.onBack?.()
    }

    // Gamepad Left/Right has no native key event to ride. A native range needs
    // its value nudged directly (a synthetic keydown would not move it); every
    // other control gets a synthetic Arrow key that its own handler processes.
    const adjust = (delta: number) => {
      const el = document.activeElement
      if (!(el instanceof HTMLElement)) return
      if (el instanceof HTMLInputElement && el.type === 'range') {
        nudgeRange(el, delta)
        return
      }
      const code = delta > 0 ? 'ArrowRight' : 'ArrowLeft'
      el.dispatchEvent(new KeyboardEvent('keydown', { code, key: code, bubbles: true }))
    }

    const applyPad = (intent: MenuIntent) => {
      switch (intent.kind) {
        case 'move':
          move(intent.delta)
          break
        case 'adjust':
          adjust(intent.delta)
          break
        case 'activate':
          activate()
          break
        case 'back':
          back()
          break
      }
    }

    const onKeyDown = (e: KeyboardEvent) => {
      const intent = keyToIntent(e.code, e.shiftKey)
      if (!intent) return
      // Enter/Space fall through to native button activation; Left/Right fall
      // through to the focused value control. The owner only drives navigation.
      if (intent.kind === 'move') {
        e.preventDefault()
        move(intent.delta)
      } else if (intent.kind === 'back' && bindBackKey) {
        e.preventDefault()
        back()
      }
    }
    window.addEventListener('keydown', onKeyDown)

    let raf = 0
    // Seed with the live pad state so a button already held on mount is not read
    // as a fresh press edge (prevents an action leaking in from the last screen).
    let prev: PadSnapshot = readPads(navigator.getGamepads?.() ?? [])
    let acceptArmed = false
    const poll = () => {
      const cur = readPads(navigator.getGamepads?.() ?? [])
      const result = padIntents(prev, cur, acceptArmed)
      acceptArmed = result.acceptArmed
      for (const intent of result.intents) applyPad(intent)
      prev = cur
      raf = requestAnimationFrame(poll)
    }
    raf = requestAnimationFrame(poll)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      cancelAnimationFrame(raf)
    }
  }, [active, rootRef, bindBackKey])
}
