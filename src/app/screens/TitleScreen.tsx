import { useRef } from 'react'
import { useSessionStore } from '../sessionStore'
import { unlockAudio, playSfx } from '../../audio/bus'
import { useMenuFocus } from '../menuFocus/useMenuFocus'
import { Button } from '../components/ui'

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
        <img
          className="title-logo"
          src="/branding/they-came-from-uranus-logo.webp"
          alt="They Came From Uranus"
          width="900"
          height="900"
        />
        <p className="title-kicker">Endless corridor survival</p>
      </div>
      <div className="menu title-menu">
        <Button data-menu-primary variant="primary" onClick={goHangar}>
          Play
        </Button>
        <Button onClick={() => setScreen('highScores')}>High Scores</Button>
        <Button onClick={() => setScreen('settings')}>Settings</Button>
      </div>
    </div>
  )
}
