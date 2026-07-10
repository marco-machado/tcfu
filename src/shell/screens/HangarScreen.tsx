import { useSessionStore } from '../../app/sessionStore'
import { unlockAudio, playSfx } from '../../audio/bus'
import { isShipUnlocked, SHIP_KIT_IDS, shipKit } from '../../sim/shipKits'
import type { ShipId } from '../../sim/types'

const PREVIEW: Record<
  ShipId,
  { body: string; accent: string; width: string; height: string }
> = {
  vanguard: { body: '#7fd4ff', accent: '#2a88bb', width: '42%', height: '58%' },
  striker: { body: '#ffb070', accent: '#c05020', width: '34%', height: '70%' },
  aegis: { body: '#90b8e0', accent: '#3060a0', width: '56%', height: '52%' },
  phantom: { body: '#6a7a98', accent: '#304060', width: '28%', height: '64%' },
}

export function HangarScreen() {
  const selectedShip = useSessionStore((s) => s.selectedShip)
  const selectShip = useSessionStore((s) => s.selectShip)
  const startRun = useSessionStore((s) => s.startRun)
  const setScreen = useSessionStore((s) => s.setScreen)
  const meta = useSessionStore((s) => s.meta)
  const careerBest = useSessionStore((s) => s.careerBest)
  const settings = useSessionStore((s) => s.settings)

  const kit = shipKit(selectedShip)
  const preview = PREVIEW[selectedShip]

  const launch = () => {
    unlockAudio()
    playSfx('ui_confirm', settings)
    startRun()
  }

  return (
    <div className="screen">
      <h2>Hangar</h2>
      <p className="muted">
        Career best {careerBest.toLocaleString()} · Scrap {meta.scrap}
      </p>
      <div className="hangar-layout">
        <div className="ship-grid">
          {SHIP_KIT_IDS.map((id) => {
            const row = shipKit(id)
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
                <strong>{row.name}</strong>
                <div className="muted">{row.blurb}</div>
                {open ? (
                  <div className="muted ship-stats">
                    HP {row.maxHp} · Hitbox {row.hitboxR} · Move ×{row.moveMult} · Bombs{' '}
                    {row.startBombs}
                    <br />
                    {row.weaponName} · {row.passiveLine}
                  </div>
                ) : (
                  <div className="muted">Unlock @ {row.unlockScore.toLocaleString()}</div>
                )}
              </button>
            )
          })}
        </div>
        <div className="kit-preview" style={{ borderColor: preview.accent }}>
          <div
            className="kit-silhouette"
            style={{
              background: preview.body,
              boxShadow: `0 0 24px ${preview.accent}`,
              width: preview.width,
              height: preview.height,
            }}
          />
          <strong>{kit.name}</strong>
          <p className="muted kit-preview-blurb">{kit.blurb}</p>
          <p className="muted ship-stats">
            {kit.weaponName}
            <br />
            {kit.passiveLine}
          </p>
        </div>
      </div>
      <div className="row">
        <button type="button" className="primary-action" onClick={launch}>
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
