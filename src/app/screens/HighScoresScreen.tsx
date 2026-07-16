import { useRef } from 'react'
import { useSessionStore } from '../sessionStore'
import { useMenuFocus } from '../menuFocus/useMenuFocus'
import { shipKit } from '../../sim/shipKits'
import { Button, Heading, Label, Panel, ScreenHeader, ScreenRails } from '../components/ui'

const TOTAL_SLOTS = 10

export function HighScoresScreen() {
  const scores = useSessionStore((s) => s.highScores)
  const careerBest = useSessionStore((s) => s.careerBest)
  const setScreen = useSessionStore((s) => s.setScreen)
  const rootRef = useRef<HTMLDivElement>(null)

  useMenuFocus({ rootRef, onBack: () => setScreen('title') })

  const top = scores[0]
  const slots = Array.from({ length: TOTAL_SLOTS - 1 }, (_, i) => scores[i + 1] ?? null)
  const bestWave = scores.reduce((max, row) => Math.max(max, row.wave), 0)
  const longestRun = scores.reduce((max, row) => Math.max(max, Math.floor(row.timeSec)), 0)
  const shipCounts = new Map<string, { name: string; count: number }>()
  for (const row of scores) {
    const entry = shipCounts.get(row.shipId) ?? { name: shipKit(row.shipId).name, count: 0 }
    entry.count += 1
    shipCounts.set(row.shipId, entry)
  }
  let topShip: string | null = null
  let topShipCount = 0
  for (const { name, count } of shipCounts.values()) {
    if (count > topShipCount) {
      topShip = name
      topShipCount = count
    }
  }

  return (
    <div className="screen screen--wide high-scores-screen" ref={rootRef}>
      <ScreenRails code="REC-07 // Flight records" />
      <ScreenHeader title="High Scores" kicker="Local flight records" />
      <div className="scores-console">
        <div className="scores-board">
          <Panel className={`score-hero${top ? '' : ' is-empty'}`}>
            <b className="score-hero-rank">01</b>
            <span className="score-hero-main">
              <strong>{top ? top.score.toLocaleString() : '···'}</strong>
              <small>
                {top
                  ? `${shipKit(top.shipId).name} · Wave ${top.wave} · ${Math.floor(top.timeSec)}s`
                  : 'No record logged · Fly a sortie to claim the top slot'}
              </small>
            </span>
            <span className="score-hero-flag">{top ? 'Record holder' : 'Slot open'}</span>
          </Panel>
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
                {slots.map((row, i) =>
                  row ? (
                    <tr key={`${row.timestamp}-${i}`}>
                      <td>{String(i + 2).padStart(2, '0')}</td>
                      <td>{row.score.toLocaleString()}</td>
                      <td>{shipKit(row.shipId).name}</td>
                      <td>{row.wave}</td>
                      <td>{Math.floor(row.timeSec)}s</td>
                    </tr>
                  ) : (
                    <tr key={`open-${i}`} className="is-open">
                      <td>{String(i + 2).padStart(2, '0')}</td>
                      <td>···</td>
                      <td>Awaiting data</td>
                      <td>·</td>
                      <td>·</td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </Panel>
        </div>
        <Panel size="lg" as="aside" className="telemetry-panel">
          <Heading size="sm" as="h3">Career telemetry</Heading>
          <p className="telemetry-best">
            <Label>Career best</Label>
            <b>{careerBest.toLocaleString()}</b>
          </p>
          <div className="telemetry-grid">
            <p>
              <Label>Slots logged</Label>
              <b>{Math.min(scores.length, TOTAL_SLOTS)} / {TOTAL_SLOTS}</b>
            </p>
            <p>
              <Label>Best wave</Label>
              <b>{bestWave > 0 ? bestWave : '·'}</b>
            </p>
            <p>
              <Label>Longest run</Label>
              <b>{longestRun > 0 ? `${longestRun}s` : '·'}</b>
            </p>
            <p>
              <Label>Top ship</Label>
              <b>{topShip ?? '·'}</b>
            </p>
          </div>
        </Panel>
      </div>
      <div className="screen-actions">
        <Button data-menu-primary variant="tertiary" icon="back" onClick={() => setScreen('title')}>
          Back
        </Button>
      </div>
    </div>
  )
}
