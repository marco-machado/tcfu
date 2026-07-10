import { useSessionStore } from '../../app/sessionStore'
import { isShipUnlocked, SHIP_KIT_IDS, shipKit } from '../../sim/shipKits'

export function HangarScreen() {
  const selectedShip = useSessionStore((s) => s.selectedShip)
  const selectShip = useSessionStore((s) => s.selectShip)
  const startRun = useSessionStore((s) => s.startRun)
  const setScreen = useSessionStore((s) => s.setScreen)
  const meta = useSessionStore((s) => s.meta)
  const careerBest = useSessionStore((s) => s.careerBest)

  return (
    <div className="screen">
      <h2>Hangar</h2>
      <p className="muted">
        Career best {careerBest.toLocaleString()} · Scrap {meta.scrap}
      </p>
      <div className="ship-grid">
        {SHIP_KIT_IDS.map((id) => {
          const kit = shipKit(id)
          const open = isShipUnlocked(id, careerBest)
          const selected = selectedShip === id
          return (
            <button
              key={id}
              type="button"
              className={`ship-card${selected ? ' selected' : ''}${open ? '' : ' locked'}`}
              disabled={!open}
              onClick={() => open && selectShip(id)}
            >
              <strong>{kit.name}</strong>
              <div className="muted">{kit.blurb}</div>
              {open ? (
                <div className="muted ship-stats">
                  HP {kit.maxHp} · Hitbox {kit.hitboxR} · Move ×{kit.moveMult} · Bombs{' '}
                  {kit.startBombs}
                  <br />
                  {kit.weaponName} · {kit.passiveLine}
                </div>
              ) : (
                <div className="muted">Unlock @ {kit.unlockScore.toLocaleString()}</div>
              )}
            </button>
          )
        })}
      </div>
      <div className="row">
        <button type="button" onClick={startRun}>
          Launch
        </button>
        <button type="button" onClick={() => setScreen('upgradeBay')}>
          Upgrade bay
        </button>
        <button type="button" onClick={() => setScreen('title')}>
          Back
        </button>
      </div>
    </div>
  )
}
