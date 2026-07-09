import type { ReactNode } from 'react'

export function Stage({ children }: { children: ReactNode }) {
  return (
    <div className="letterbox">
      <div className="stage">{children}</div>
    </div>
  )
}
