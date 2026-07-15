import { useSessionStore } from '../sessionStore'
import { unlockAudio, playSfx } from '../../audio/bus'
import { BrandMark, Button } from '../components/ui'

export function TitleScreen() {
  const setScreen = useSessionStore((s) => s.setScreen)
  const settings = useSessionStore((s) => s.settings)

  const goHangar = () => {
    unlockAudio()
    playSfx('ui_confirm', settings)
    setScreen('hangar')
  }

  return (
    <div className="screen title-screen">
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
        <Button variant="primary" onClick={goHangar}>
          Play
        </Button>
        <Button onClick={() => setScreen('highScores')}>High Scores</Button>
        <Button onClick={() => setScreen('settings')}>Settings</Button>
      </div>
      <p className="muted title-controls">WASD / arrows · Space fire · Shift bomb · Esc pause</p>
    </div>
  )
}
