import { useSessionStore } from '../../app/sessionStore'

export function ResultsScreen() {
  const lastRun = useSessionStore((s) => s.lastRun)
  const setScreen = useSessionStore((s) => s.setScreen)
  const startRun = useSessionStore((s) => s.startRun)

  return (
    <div className="screen">
      <header className="screen-header">
        <h2>Debrief</h2>
        <p className="screen-kicker">Run telemetry and salvage</p>
      </header>
      {lastRun ? (
        <div className="results-body">
          <p className="results-score">
            <span className="hud-label">Final score</span>
            {lastRun.score.toLocaleString()}
          </p>
          <div className="results-stats">
            <span>{lastRun.shipName}</span>
            <span>Wave {lastRun.wave}</span>
            <span>Kills {lastRun.kills}</span>
            <span>Best chain {lastRun.bestCombo}</span>
            <span>Grazes {lastRun.grazes}</span>
            <span>Time {Math.floor(lastRun.timeSec)}s</span>
          </div>
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
        <button type="button" className="primary-action" onClick={startRun}>
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
