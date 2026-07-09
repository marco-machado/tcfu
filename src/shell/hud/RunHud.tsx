import { useEffect, useState } from 'react'
import { scrapForRun } from '../../sim/constants'
import { getWorld } from '../../sim/world'

export function RunHud() {
  const [, tick] = useState(0)

  useEffect(() => {
    let id = 0
    const loop = () => {
      tick((n) => n + 1)
      id = requestAnimationFrame(loop)
    }
    id = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(id)
  }, [])

  const w = getWorld()
  const p = w.player
  const s = w.session
  const wavesCompleted = Math.max(0, s.wave - 1)
  const scrapEst = scrapForRun(s.score, wavesCompleted)
  const dying = s.runOver && s.endHold > 0

  return (
    <div className="hud">
      <div className="hud-top">
        <span>SCORE {Math.floor(s.score)}</span>
        <span>KILLS {s.kills}</span>
        <span>WAVE {s.wave}</span>
        <span>BOMBS {p.bombs}</span>
      </div>
      <div />
      <div className="hud-bottom">
        <span>
          HP {'●'.repeat(Math.max(0, p.hp))}
          {'○'.repeat(Math.max(0, p.maxHp - p.hp))} · LIVES {p.lives}
          {p.shield ? ' · SHIELD' : ''}
        </span>
        <span>
          SCRAP ~{scrapEst} · TIER {p.weaponTier}
        </span>
      </div>
      {s.paused && !dying && (
        <div className="overlay">
          <div className="panel">
            <h2>Paused</h2>
            <p className="muted">Press Esc / P or Start to resume</p>
          </div>
        </div>
      )}
      {dying && (
        <div className="overlay death-overlay">
          <div className="panel death-panel">
            <h2>Destroyed</h2>
            <p className="muted">Run over · salvaging wreckage…</p>
          </div>
        </div>
      )}
    </div>
  )
}
