import { useSessionStore } from '../../app/sessionStore'
import { unlockAudio, playSfx } from '../../audio/bus'
import { isShipUnlocked, SHIP_KIT_IDS, shipKit } from '../../sim/shipKits'
import { kitRecipe } from '../../view/procedural/registry'
import { materialToken } from '../../view/procedural/materialTokens'
import { ShipKitPreview } from '../../view/procedural/ShipKitPreview'
import { SignalIcon } from '../SignalIcon'

function metricWidth(value: number): { width: string } {
  return { width: `${Math.max(10, Math.min(100, value * 100))}%` }
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
  const accent = materialToken(kitRecipe(selectedShip).thrusterToken).emissive

  const launch = () => {
    unlockAudio()
    playSfx('ui_confirm', settings)
    startRun()
  }

  return (
    <div className={`screen hangar-screen${settings.reducedMotion ? ' motion-reduced' : ''}`}>
      <header className="screen-header">
        <h2>Hangar</h2>
        <div className="hangar-resources" aria-label="Career resources">
          <span className="resource-chip is-career">
            <SignalIcon name="career" />
            <span><small>Career best</small><b>{careerBest.toLocaleString()}</b></span>
          </span>
          <span className="resource-chip is-scrap">
            <SignalIcon name="scrap" />
            <span><small>Scrap</small><b>{meta.scrap.toLocaleString()}</b></span>
          </span>
        </div>
      </header>
      <div className="hangar-layout">
        <section className="kit-preview" style={{ borderColor: accent }} aria-label={`${kit.name} preview`}>
          <div className="preview-rail"><span>Active frame</span><i /></div>
          <ShipKitPreview shipId={selectedShip} />
          <div className="kit-preview-copy">
            <div className="kit-preview-heading">
              <SignalIcon name={selectedShip} />
              <div><small>Selected kit</small><strong>{kit.name}</strong></div>
            </div>
            <p className="muted kit-preview-blurb">{kit.blurb}</p>
            <div className="kit-metrics" aria-label="Selected kit attributes">
              <div><span>Hull <b>{kit.maxHp}</b></span><i><em style={metricWidth(kit.maxHp / 3)} /></i></div>
              <div><span>Mobility <b>×{kit.moveMult}</b></span><i><em style={metricWidth(kit.moveMult / 1.25)} /></i></div>
              <div><span>Profile <b>{kit.hitboxR}</b></span><i><em style={metricWidth((0.42 - kit.hitboxR) / 0.14)} /></i></div>
              <div><span>Bombs <b>{kit.startBombs}</b></span><i><em style={metricWidth(kit.startBombs / 3)} /></i></div>
            </div>
            <div className="kit-loadout"><span>{kit.weaponName}</span><span>{kit.passiveLine}</span></div>
          </div>
        </section>
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
                <span className="ship-card-mark"><SignalIcon name={id} /></span>
                <span className="ship-card-copy">
                  <strong>{row.name}</strong>
                  <span className="muted">{row.blurb}</span>
                </span>
                {open ? (
                  <span className="ship-card-stats">
                    <span>HP <b>{row.maxHp}</b></span>
                    <span>Move <b>×{row.moveMult}</b></span>
                    <span>Profile <b>{row.hitboxR}</b></span>
                    <span>Bombs <b>{row.startBombs}</b></span>
                  </span>
                ) : (
                  <span className="ship-card-lock"><SignalIcon name="lock" /> Unlock at {row.unlockScore.toLocaleString()}</span>
                )}
              </button>
            )
          })}
        </div>
      </div>
      <div className="hangar-actions">
        <button type="button" className="primary-action" onClick={launch}>
          <SignalIcon name="launch" /> <span>Launch <small>{kit.name}</small></span>
        </button>
        <button type="button" onClick={() => setScreen('upgradeBay')}>
          <SignalIcon name="upgrade" /> <span>Upgrade bay <small>{meta.scrap} scrap available</small></span>
        </button>
        <button type="button" className="tertiary-action" onClick={() => setScreen('title')}>
          <SignalIcon name="back" /> Back
        </button>
      </div>
    </div>
  )
}
