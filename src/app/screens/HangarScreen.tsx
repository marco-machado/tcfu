import { useSessionStore } from '../sessionStore'
import { unlockAudio, playSfx } from '../../audio/bus'
import { isShipUnlocked, SHIP_KIT_IDS, shipKit } from '../../sim/shipKits'
import { kitRecipe } from '../../view/procedural/registry'
import { materialToken } from '../../view/procedural/materialTokens'
import { ShipKitPreview } from '../../view/procedural/ShipKitPreview'
import { Button, Chip, Icon, Meter, Panel, ScreenHeader, cn } from '../components/ui'

function metricValue(value: number): number {
  return Math.max(0.1, Math.min(1, value))
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
      <ScreenHeader title="Hangar">
        <div className="hangar-resources" aria-label="Career resources">
          <Chip icon="career" className="resource-chip">
            <span>
              <small>Career best</small>
              <b>{careerBest.toLocaleString()}</b>
            </span>
          </Chip>
          <Chip tone="scrap" icon="scrap" className="resource-chip">
            <span>
              <small>Scrap</small>
              <b>{meta.scrap.toLocaleString()}</b>
            </span>
          </Chip>
        </div>
      </ScreenHeader>
      <div className="hangar-layout">
        <Panel
          as="section"
          size="lg"
          className="kit-preview"
          style={{ borderColor: accent }}
          aria-label={`${kit.name} preview`}
        >
          <div className="preview-rail">
            <span>Active frame</span>
            <i />
          </div>
          <ShipKitPreview shipId={selectedShip} />
          <div className="kit-preview-copy">
            <div className="kit-preview-heading">
              <Icon name={selectedShip} />
              <div>
                <small>Selected kit</small>
                <strong>{kit.name}</strong>
              </div>
            </div>
            <p className="muted kit-preview-blurb">{kit.blurb}</p>
            <div className="kit-metrics" aria-label="Selected kit attributes">
              <div>
                <span>Hull <b>{kit.maxHp}</b></span>
                <Meter value={metricValue(kit.maxHp / 3)} aria-label="Hull" />
              </div>
              <div>
                <span>Mobility <b>×{kit.moveMult}</b></span>
                <Meter value={metricValue(kit.moveMult / 1.25)} aria-label="Mobility" />
              </div>
              <div>
                <span>Profile <b>{kit.hitboxR}</b></span>
                <Meter value={metricValue((0.42 - kit.hitboxR) / 0.14)} aria-label="Profile" />
              </div>
              <div>
                <span>Bombs <b>{kit.startBombs}</b></span>
                <Meter value={metricValue(kit.startBombs / 3)} aria-label="Bombs" />
              </div>
            </div>
            <div className="kit-loadout">
              <span>{kit.weaponName}</span>
              <span>{kit.passiveLine}</span>
            </div>
          </div>
        </Panel>
        <div className="ship-grid">
          {SHIP_KIT_IDS.map((id) => {
            const row = shipKit(id)
            const open = isShipUnlocked(id, careerBest)
            const selected = selectedShip === id
            return (
              <Panel
                as="button"
                key={id}
                type="button"
                className={cn('ship-card', selected && 'selected', !open && 'locked')}
                disabled={!open}
                onClick={() => open && selectShip(id)}
              >
                <span className="ship-card-mark">
                  <Icon name={id} />
                </span>
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
                  <span className="ship-card-lock">
                    <Icon name="lock" /> Unlock at {row.unlockScore.toLocaleString()}
                  </span>
                )}
              </Panel>
            )
          })}
        </div>
      </div>
      <div className="hangar-actions">
        <Button variant="primary" icon="launch" onClick={launch}>
          <span>
            Launch <small>{kit.name}</small>
          </span>
        </Button>
        <Button icon="upgrade" onClick={() => setScreen('upgradeBay')}>
          <span>
            Upgrade bay <small>{meta.scrap} scrap available</small>
          </span>
        </Button>
        <Button variant="tertiary" icon="back" onClick={() => setScreen('title')}>
          Back
        </Button>
      </div>
    </div>
  )
}
