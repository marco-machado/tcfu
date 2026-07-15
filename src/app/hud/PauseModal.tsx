import { useRef, useState } from 'react'
import { useSessionStore } from '../sessionStore'
import { getWorld } from '../../sim/world'
import { useMenuFocus } from '../menuFocus/useMenuFocus'
import { Button, Modal, cn } from '../components/ui'

type DestructiveAction = 'restart' | 'exit'

export function PauseModal() {
  const openSettings = useSessionStore((s) => s.openSettings)
  const setScreen = useSessionStore((s) => s.setScreen)
  const startRun = useSessionStore((s) => s.startRun)
  const [confirming, setConfirming] = useState<DestructiveAction | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  const resume = () => {
    getWorld().session.paused = false
  }

  // Esc/P resume stays on the run-input path (SimDriver toggles pause on that
  // edge); the owner only binds gamepad B here, so back is not double-handled.
  useMenuFocus({
    rootRef,
    bindBackKey: false,
    onBack: resume,
    isArmed: () => confirming !== null,
    onCancelArming: () => setConfirming(null),
  })

  const requestDestructive = (action: DestructiveAction, run: () => void) => {
    if (confirming === action) {
      run()
      return
    }
    setConfirming(action)
  }

  return (
    <Modal
      overlayTone="pause"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pause-title"
      title="Paused"
      titleId="pause-title"
    >
      <div className="modal-actions" ref={rootRef}>
        <Button data-menu-primary variant="primary" onClick={resume}>
          Resume
        </Button>
        <Button variant="secondary" onClick={() => openSettings('run')}>
          Settings
        </Button>
        <Button
          variant="danger"
          className={cn(confirming === 'restart' && 'is-arming')}
          onClick={() => requestDestructive('restart', startRun)}
        >
          {confirming === 'restart' ? 'Confirm restart' : 'Restart run'}
        </Button>
        <Button
          variant="ghost"
          className={cn(confirming === 'exit' && 'is-arming')}
          onClick={() => requestDestructive('exit', () => setScreen('hangar'))}
        >
          {confirming === 'exit' ? 'Confirm exit' : 'Exit to hangar'}
        </Button>
      </div>
      <p className="modal-hint">
        {confirming ? 'Activate again to confirm losing this Run' : 'Esc / P or Start resumes'}
      </p>
    </Modal>
  )
}
