import { useEffect, useState } from 'react'
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
          HP {'●'.repeat(p.hp)}
          {'○'.repeat(Math.max(0, p.maxHp - p.hp))} · LIVES {p.lives}
          {p.shield ? ' · SHIELD' : ''}
        </span>
        <span>
          TIER {p.weaponTier} · W {p.wCells}
        </span>
      </div>
      {s.paused && (
        <div className="overlay">
          <div className="panel">
            <h2>Paused</h2>
            <p className="muted">Press Esc / P or Start to resume</p>
          </div>
        </div>
      )}
    </div>
  )
}
