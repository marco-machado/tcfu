import { useEffect, useRef, useState } from 'react'
import { useSessionStore } from '../sessionStore'
import { getWorld } from '../../sim/world'
import { Button, Modal, cn } from '../components/ui'

type DestructiveAction = 'restart' | 'exit'

export function PauseModal() {
  const openSettings = useSessionStore((s) => s.openSettings)
  const setScreen = useSessionStore((s) => s.setScreen)
  const startRun = useSessionStore((s) => s.startRun)
  const [confirming, setConfirming] = useState<DestructiveAction | null>(null)
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    buttonsRef.current[0]?.focus()
  }, [])

  useEffect(() => {
    const focusables = () =>
      buttonsRef.current.filter((b): b is HTMLButtonElement => b !== null && !b.disabled)

    const moveFocus = (delta: number) => {
      const items = focusables()
      if (items.length === 0) return
      const index = items.indexOf(document.activeElement as HTMLButtonElement)
      const next = items[(index + delta + items.length) % items.length]!
      next.focus()
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Tab') {
        e.preventDefault()
        moveFocus(e.shiftKey ? -1 : 1)
      } else if (e.code === 'ArrowDown') {
        e.preventDefault()
        moveFocus(1)
      } else if (e.code === 'ArrowUp') {
        e.preventDefault()
        moveFocus(-1)
      }
    }
    window.addEventListener('keydown', onKeyDown)

    let raf = 0
    let firstPoll = true
    let prevUp = false
    let prevDown = false
    let prevAccept = false
    let prevBack = false
    // Activation waits for a press seen inside the modal, then fires on
    // release, so a button held into or out of the modal cannot leak an
    // action into gameplay input.
    let acceptArmed = false
    const pollGamepad = () => {
      const pads = navigator.getGamepads?.() ?? []
      let up = false
      let down = false
      let accept = false
      let back = false
      for (const pad of pads) {
        if (!pad) continue
        const axisY = pad.axes[1] ?? 0
        if (pad.buttons[12]?.pressed || axisY < -0.5) up = true
        if (pad.buttons[13]?.pressed || axisY > 0.5) down = true
        if (pad.buttons[0]?.pressed) accept = true
        if (pad.buttons[1]?.pressed) back = true
      }
      if (firstPoll) {
        firstPoll = false
      } else {
        if (up && !prevUp) moveFocus(-1)
        if (down && !prevDown) moveFocus(1)
        if (accept && !prevAccept) acceptArmed = true
        if (!accept && prevAccept && acceptArmed) {
          acceptArmed = false
          const active = document.activeElement
          if (active instanceof HTMLButtonElement && focusables().includes(active)) {
            active.click()
          }
        }
        if (back && !prevBack) setConfirming(null)
      }
      prevUp = up
      prevDown = down
      prevAccept = accept
      prevBack = back
      raf = requestAnimationFrame(pollGamepad)
    }
    raf = requestAnimationFrame(pollGamepad)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      cancelAnimationFrame(raf)
    }
  }, [])

  const resume = () => {
    getWorld().session.paused = false
  }

  const requestDestructive = (action: DestructiveAction, run: () => void) => {
    if (confirming === action) {
      run()
      return
    }
    setConfirming(action)
  }

  const setButtonRef = (index: number) => (el: HTMLButtonElement | null) => {
    buttonsRef.current[index] = el
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
      <div className="modal-actions">
        <Button ref={setButtonRef(0)} variant="primary" onClick={resume}>
          Resume
        </Button>
        <Button ref={setButtonRef(1)} variant="secondary" onClick={() => openSettings('run')}>
          Settings
        </Button>
        <Button
          ref={setButtonRef(2)}
          variant="danger"
          className={cn(confirming === 'restart' && 'is-arming')}
          onClick={() => requestDestructive('restart', startRun)}
        >
          {confirming === 'restart' ? 'Confirm restart' : 'Restart run'}
        </Button>
        <Button
          ref={setButtonRef(3)}
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
