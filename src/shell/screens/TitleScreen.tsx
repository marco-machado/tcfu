import { useSessionStore } from '../../app/sessionStore'
import { unlockAudio, playSfx, syncMusic } from '../../audio/bus'
import { BrandMark } from '../brand/BrandMark'

export function TitleScreen() {
  const setScreen = useSessionStore((s) => s.setScreen)
  const settings = useSessionStore((s) => s.settings)

  const goHangar = () => {
    unlockAudio()
    syncMusic(settings)
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
        <button type="button" className="primary-action" onClick={goHangar}>
          Play
        </button>
        <button type="button" onClick={() => setScreen('highScores')}>
          High Scores
        </button>
        <button type="button" onClick={() => setScreen('settings')}>
          Settings
        </button>
      </div>
      <p className="muted title-controls">WASD / arrows · Space fire · Shift bomb · Esc pause</p>
    </div>
  )
}
