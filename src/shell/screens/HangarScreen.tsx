import { useSessionStore } from '../../app/sessionStore'
import { unlockAudio, playSfx } from '../../audio/bus'
import { isShipUnlocked, SHIP_KIT_IDS, shipKit } from '../../sim/shipKits'
import { kitRecipe } from '../../view/procedural/registry'
import { materialToken } from '../../view/procedural/materialTokens'
import { ShipKitPreview } from '../../view/procedural/ShipKitPreview'

export function HangarScreen() {
  const selectedShip = useSessionStore((s) => s.selectedShip)
  const selectShip = useSessionStore((s) => s.selectShip)
  const startRun = useSessionStore((s) => s.startRun)
  const setScreen = useSessionStore((s) => s.setScreen)
  const meta = useSessionStore((s) => s.meta)
  const careerBest = useSessionStore((s) => s.careerBest)
  const settings = useSessionStore((s) => s.settings)

  const kit = shipKit(selectedShip)
  const accent = materialToken(kitRecipe(selectedShip).thrusterToken).emissive

  const launch = () => {
    unlockAudio()
    playSfx('ui_confirm', settings)
    startRun()
  }

  return (
    <div className="screen">
      <header className="screen-header">
        <h2>Hangar</h2>
        <p className="screen-kicker">
          Career best {careerBest.toLocaleString()} · Scrap {meta.scrap}
        </p>
      </header>
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
        <div className="kit-preview" style={{ borderColor: accent }}>
          <ShipKitPreview shipId={selectedShip} />
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
