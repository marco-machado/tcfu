import { useSessionStore } from '../sessionStore'
import { Button, ScreenHeader } from '../components/ui'

export function HighScoresScreen() {
  const scores = useSessionStore((s) => s.highScores)
  const setScreen = useSessionStore((s) => s.setScreen)

  return (
    <div className="screen">
      <ScreenHeader title="High Scores" kicker="Local flight records" />
      {scores.length === 0 ? (
        <p className="muted">No scores yet</p>
      ) : (
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
                <td>{row.shipId}</td>
                <td>{row.wave}</td>
                <td>{Math.floor(row.timeSec)}s</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <Button onClick={() => setScreen('title')}>Back</Button>
    </div>
  )
}
