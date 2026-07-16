import { useRef } from 'react'
import { useSessionStore } from '../sessionStore'
import { useMenuFocus } from '../menuFocus/useMenuFocus'
import { Button, Chip, Label, Panel, ScreenHeader } from '../components/ui'

export function ResultsScreen() {
  const lastRun = useSessionStore((s) => s.lastRun)
  const setScreen = useSessionStore((s) => s.setScreen)
  const startRun = useSessionStore((s) => s.startRun)
  const rootRef = useRef<HTMLDivElement>(null)

  useMenuFocus({ rootRef, onBack: () => setScreen('hangar') })

  return (
    <div className="screen screen--narrow results-screen" ref={rootRef}>
      <ScreenHeader title="Debrief" kicker="Run telemetry and salvage" />
      {lastRun ? (
        <Panel size="lg" className="results-body">
          <p className="results-score">
            <Label>Final score</Label>
            {lastRun.score.toLocaleString()}
          </p>
          <div className="results-stats">
            <Chip>{lastRun.shipName}</Chip>
            <Chip>Wave {lastRun.wave}</Chip>
            <Chip>Kills {lastRun.kills}</Chip>
            <Chip>Best chain {lastRun.bestCombo}</Chip>
            <Chip>Grazes {lastRun.grazes}</Chip>
            <Chip>Time {Math.floor(lastRun.timeSec)}s</Chip>
          </div>
          <p className="muted">Career best {lastRun.careerBest.toLocaleString()}</p>
          {lastRun.unlockedKitNames.length > 0 ? (
            <p className="unlock-note">Unlocked {lastRun.unlockedKitNames.join(', ')}</p>
          ) : null}
          <Panel size="sm" className="scrap-panel">
            <p className="scrap-total">Scrap +{lastRun.scrapEarned}</p>
            <p className="muted scrap-note">
              Salvaged at debrief (not mid-run pickups): score/100 →{' '}
              {lastRun.scrapFromScore}, waves completed ×5 → {lastRun.scrapFromWaves}
              {lastRun.scrapEarnMult > 1
                ? ` · Salvage ×${lastRun.scrapEarnMult.toFixed(2)}`
                : ''}
            </p>
          </Panel>
        </Panel>
      ) : (
        <p className="muted">No run data</p>
      )}
      <div className="menu">
        <Button data-menu-primary variant="primary" onClick={startRun}>
          Quick retry
        </Button>
        <Button onClick={() => setScreen('hangar')}>Hangar</Button>
        <Button onClick={() => setScreen('highScores')}>High Scores</Button>
        <Button onClick={() => setScreen('title')}>Title</Button>
      </div>
    </div>
  )
}
