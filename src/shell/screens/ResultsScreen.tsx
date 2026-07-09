import { useSessionStore } from '../../app/sessionStore'

export function ResultsScreen() {
  const lastRun = useSessionStore((s) => s.lastRun)
  const setScreen = useSessionStore((s) => s.setScreen)
  const startRun = useSessionStore((s) => s.startRun)

  return (
    <div className="screen">
      <h2>Results</h2>
      {lastRun ? (
        <div>
          <p>Score {lastRun.score}</p>
          <p className="muted">
            {lastRun.shipId} · Wave {lastRun.wave} · Kills {lastRun.kills} · Time{' '}
            {Math.floor(lastRun.timeSec)}s · Scrap {lastRun.scrapEarned}
          </p>
        </div>
      ) : (
        <p className="muted">No run data</p>
      )}
      <div className="menu">
        <button type="button" onClick={startRun}>
          Quick retry
        </button>
        <button type="button" onClick={() => setScreen('hangar')}>
          Hangar
        </button>
        <button type="button" onClick={() => setScreen('highScores')}>
          High Scores
        </button>
        <button type="button" onClick={() => setScreen('title')}>
          Title
        </button>
      </div>
    </div>
  )
}
