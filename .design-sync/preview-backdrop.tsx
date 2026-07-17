import type { ReactNode } from 'react'

export function PreviewBackdrop({ children }: { children?: ReactNode }) {
  return (
    <div
      style={{
        background: '#03070b',
        color: '#eaf8ff',
        padding: 20,
        display: 'inline-block',
        minWidth: 'min-content',
      }}
    >
      {children}
    </div>
  )
}
