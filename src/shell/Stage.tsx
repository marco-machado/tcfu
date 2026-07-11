import type { ReactNode } from 'react'
import { useSessionStore } from '../app/sessionStore'
import { MenuBackdrop } from './MenuBackdrop'

export function Stage({ children }: { children: ReactNode }) {
  const screen = useSessionStore((s) => s.screen)
  return (
    <div className="letterbox">
      <div className="stage">
        {screen !== 'run' && <MenuBackdrop />}
        {children}
      </div>
    </div>
  )
}
