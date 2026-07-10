import { pushPresentation } from '../sim/presentation'
import { getWorld } from '../sim/world'
import { useSessionStore } from './sessionStore'

type AcceptanceSeam = {
  getWorld: typeof getWorld
  sessionStore: typeof useSessionStore
  pushPresentation: typeof pushPresentation
}

declare global {
  interface Window {
    __tcfuAcceptance?: AcceptanceSeam
  }
}

/**
 * Dev-only browser acceptance seam. Exposes the authoritative Run state and
 * the shell store so browser-level checks can establish controlled states
 * without coupling tests to React or CSS internals.
 */
export function installAcceptanceSeam(): void {
  if (!import.meta.env.DEV) return
  window.__tcfuAcceptance = {
    getWorld,
    sessionStore: useSessionStore,
    pushPresentation,
  }
}
