import { useSessionStore } from '../../app/sessionStore'
import type { ShipId } from '../../sim/types'

const SHIPS: { id: ShipId; name: string; unlock: number; blurb: string }[] = [
  { id: 'vanguard', name: 'Vanguard', unlock: 0, blurb: 'Balanced starter' },
  { id: 'striker', name: 'Striker', unlock: 25000, blurb: 'Glass offense' },
  { id: 'aegis', name: 'Aegis', unlock: 75000, blurb: 'Armored wing' },
  { id: 'phantom', name: 'Phantom', unlock: 150000, blurb: 'Mobility dart' },
]

export function HangarScreen() {
  const selectedShip = useSessionStore((s) => s.selectedShip)
  const selectShip = useSessionStore((s) => s.selectShip)
  const startRun = useSessionStore((s) => s.startRun)
  const setScreen = useSessionStore((s) => s.setScreen)
  const meta = useSessionStore((s) => s.meta)
  const best = useSessionStore((s) =>
    s.highScores.reduce((m, row) => Math.max(m, row.score), 0),
  )

  return (
    <div className="screen">
      <h2>Hangar</h2>
      <p className="muted">
        Best {best} · Scrap {meta.scrap}
      </p>
      <div className="ship-grid">
        {SHIPS.map((ship) => {
          const open = ship.id === 'vanguard' || best >= ship.unlock
          return (
            <button
              key={ship.id}
              type="button"
              className={`ship-card${selectedShip === ship.id ? ' selected' : ''}${open ? '' : ' locked'}`}
              disabled={!open}
              onClick={() => open && selectShip(ship.id)}
            >
              <strong>{ship.name}</strong>
              <div className="muted">
                {open ? ship.blurb : `Unlock @ ${ship.unlock.toLocaleString()}`}
              </div>
            </button>
          )
        })}
      </div>
      <div className="row">
        <button type="button" onClick={startRun}>
          Launch
        </button>
        <button type="button" onClick={() => setScreen('title')}>
          Back
        </button>
      </div>
      <p className="muted">Upgrade bay UI comes later · meta data is wired in persist/</p>
    </div>
  )
}
