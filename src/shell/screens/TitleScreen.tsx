import { useSessionStore } from '../../app/sessionStore'
import { unlockAudio, playSfx } from '../../audio/bus'

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
      <p className="title-kicker muted">Endless survival · desktop 4:3</p>
      <h1 className="title-mark">TCFU</h1>
      <p className="title-tagline">Hold the band. Ride the stream. Die with a high score.</p>
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
