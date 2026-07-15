import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from './cn'
import { Overlay, type OverlayTone } from './Overlay'
import { Panel, type PanelTone } from './Panel'
import { Heading } from './Heading'

type Props = HTMLAttributes<HTMLDivElement> & {
  title: ReactNode
  titleId?: string
  sub?: ReactNode
  overlayTone?: OverlayTone
  tone?: PanelTone
  children?: ReactNode
}

export function Modal({
  title,
  titleId,
  sub,
  overlayTone = 'default',
  tone = 'default',
  className,
  children,
  ...rest
}: Props) {
  return (
    <Overlay tone={overlayTone}>
      <Panel tone={tone} className={cn('modal', className)} {...rest}>
        <Heading size="md" id={titleId} className="modal-title">
          {title}
        </Heading>
        {sub ? <p className="modal-sub">{sub}</p> : null}
        {children}
      </Panel>
    </Overlay>
  )
}
