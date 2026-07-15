import { useRef } from 'react'
import { useSessionStore } from '../sessionStore'
import { unlockAudio, playSfx } from '../../audio/bus'
import { useMenuFocus } from '../menuFocus/useMenuFocus'
import { BrandMark, Button } from '../components/ui'

export function TitleScreen() {
  const setScreen = useSessionStore((s) => s.setScreen)
  const settings = useSessionStore((s) => s.settings)
  const rootRef = useRef<HTMLDivElement>(null)

  // Title is the top of the back map: Esc/B do nothing (no onBack).
  useMenuFocus({ rootRef })

  const goHangar = () => {
    unlockAudio()
    playSfx('ui_confirm', settings)
    setScreen('hangar')
  }

  return (
    <div className="screen title-screen" ref={rootRef}>
      <div className="title-lockup">
        <BrandMark className="title-insignia" decorative />
        <div className="title-wordmark" aria-label="TCFU">
          <span>TC</span>
          <i aria-hidden="true" />
          <span>FU</span>
        </div>
        <p className="title-kicker">Endless corridor survival</p>
      </div>
      <p className="title-tagline">
        <span>Hold the band.</span> Ride the stream. Die with a high score.
      </p>
      <div className="menu title-menu">
        <Button data-menu-primary variant="primary" onClick={goHangar}>
          Play
        </Button>
        <Button onClick={() => setScreen('highScores')}>High Scores</Button>
        <Button onClick={() => setScreen('settings')}>Settings</Button>
      </div>
      <p className="muted title-controls">WASD / arrows · Space fire · Shift bomb · Esc pause</p>
    </div>
  )
}
