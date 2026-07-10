import { useSessionStore } from '../../app/sessionStore'

export function ResultsScreen() {
  const lastRun = useSessionStore((s) => s.lastRun)
  const setScreen = useSessionStore((s) => s.setScreen)
  const startRun = useSessionStore((s) => s.startRun)

  return (
    <div className="screen">
      <h2>Results</h2>
      {lastRun ? (
        <div className="results-body">
          <p className="results-score">Score {lastRun.score}</p>
          <p className="muted">
            {lastRun.shipName} · Wave {lastRun.wave} · Kills {lastRun.kills} · Time{' '}
            {Math.floor(lastRun.timeSec)}s
          </p>
          <p className="muted">Career best {lastRun.careerBest.toLocaleString()}</p>
          {lastRun.unlockedKitNames.length > 0 ? (
            <p className="unlock-note">
              Unlocked {lastRun.unlockedKitNames.join(', ')}
            </p>
          ) : null}
          <div className="scrap-panel">
            <p className="scrap-total">Scrap +{lastRun.scrapEarned}</p>
            <p className="muted scrap-note">
              Salvaged at debrief (not mid-run pickups): score/100 →{' '}
              {lastRun.scrapFromScore}, waves completed ×5 → {lastRun.scrapFromWaves}
              {lastRun.scrapEarnMult > 1
                ? ` · Salvage ×${lastRun.scrapEarnMult.toFixed(2)}`
                : ''}
            </p>
          </div>
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
