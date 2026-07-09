import { useSessionStore } from '../../app/sessionStore'

export function TitleScreen() {
  const setScreen = useSessionStore((s) => s.setScreen)

  return (
    <div className="screen">
      <h1>TCFU</h1>
      <p>Vertical spaceshooter · endless survival</p>
      <div className="menu">
        <button type="button" onClick={() => setScreen('hangar')}>
          Play
        </button>
        <button type="button" onClick={() => setScreen('highScores')}>
          High Scores
        </button>
        <button type="button" onClick={() => setScreen('settings')}>
          Settings
        </button>
      </div>
      <p className="muted">Desktop 4:3 · WASD / arrows · Space fire · Shift bomb</p>
    </div>
  )
}
