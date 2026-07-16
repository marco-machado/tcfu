import { useRef } from 'react'
import { useSessionStore } from '../sessionStore'
import { useMenuFocus } from '../menuFocus/useMenuFocus'
import { shipKit } from '../../sim/shipKits'
import { Button, Panel, ScreenHeader } from '../components/ui'

export function HighScoresScreen() {
  const scores = useSessionStore((s) => s.highScores)
  const setScreen = useSessionStore((s) => s.setScreen)
  const rootRef = useRef<HTMLDivElement>(null)

  useMenuFocus({ rootRef, onBack: () => setScreen('title') })

  return (
    <div className="screen screen--narrow high-scores-screen" ref={rootRef}>
      <ScreenHeader title="High Scores" kicker="Local flight records" />
      {scores.length === 0 ? (
        <p className="muted">No scores yet</p>
      ) : (
        <Panel size="lg" className="scores-panel">
          <table className="scores">
            <thead>
              <tr>
                <th>#</th>
                <th>Score</th>
                <th>Ship</th>
                <th>Wave</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((row, i) => (
                <tr key={`${row.timestamp}-${i}`}>
                  <td>{i + 1}</td>
                  <td>{row.score}</td>
                  <td>{shipKit(row.shipId).name}</td>
                  <td>{row.wave}</td>
                  <td>{Math.floor(row.timeSec)}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}
      <div className="screen-actions">
        <Button data-menu-primary variant="tertiary" icon="back" onClick={() => setScreen('title')}>
          Back to title
        </Button>
      </div>
    </div>
  )
}
