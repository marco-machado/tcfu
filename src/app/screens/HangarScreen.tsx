import { useEffect, useRef, useState } from 'react'
import { useSessionStore } from '../sessionStore'
import { unlockAudio, playSfx } from '../../audio/bus'
import { useMenuFocus } from '../menuFocus/useMenuFocus'
import { SHIP_KIT_IDS, shipKit } from '../../sim/shipKits'
import { carouselModel, initialIndex, pageIndex } from '../hangarCarousel/policy'
import { HangarDeck } from '../../view/procedural/HangarDeck'
import { Button, Chip, Icon, Meter, Panel, ScreenHeader, cn } from '../components/ui'

const DRAG_PAGE_PX = 64

function metricValue(value: number): number {
  return Math.max(0.1, Math.min(1, value))
}

function Chevron() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m15 5-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function HangarScreen() {
  const selectedShip = useSessionStore((s) => s.selectedShip)
  const selectShip = useSessionStore((s) => s.selectShip)
  const startRun = useSessionStore((s) => s.startRun)
  const setScreen = useSessionStore((s) => s.setScreen)
  const meta = useSessionStore((s) => s.meta)
  const careerBest = useSessionStore((s) => s.careerBest)
  const settings = useSessionStore((s) => s.settings)
  const rootRef = useRef<HTMLDivElement>(null)
  const dragFrom = useRef<number | null>(null)

  const [index, setIndex] = useState(() => initialIndex(SHIP_KIT_IDS, selectedShip))
  const model = carouselModel(SHIP_KIT_IDS, index, careerBest)
  const kit = shipKit(model.centeredId)

  useMenuFocus({ rootRef, onBack: () => setScreen('title') })

  useEffect(() => {
    if (model.commit && model.commit !== selectedShip) selectShip(model.commit)
  }, [model.commit, selectShip, selectedShip])

  const page = (delta: -1 | 1) => {
    setIndex((current) => {
      const next = pageIndex(current, delta, SHIP_KIT_IDS.length)
      if (next !== current) playSfx('ui_move', useSessionStore.getState().settings)
      return next
    })
  }

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.code || e.key
      if (key === 'ArrowLeft') page(-1)
      else if (key === 'ArrowRight') page(1)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const launch = () => {
    unlockAudio()
    playSfx('ui_confirm', settings)
    startRun()
  }

  return (
    <div
      className={`screen hangar-screen${settings.reducedMotion ? ' motion-reduced' : ''}`}
      ref={rootRef}
    >
      <div
        className="hangar-scene"
        onPointerDown={(e) => {
          dragFrom.current = e.clientX
          e.currentTarget.setPointerCapture(e.pointerId)
        }}
        onPointerMove={(e) => {
          if (dragFrom.current === null) return
          const dx = e.clientX - dragFrom.current
          if (Math.abs(dx) < DRAG_PAGE_PX) return
          page(dx < 0 ? 1 : -1)
          dragFrom.current = null
        }}
        onPointerUp={() => (dragFrom.current = null)}
        onPointerCancel={() => (dragFrom.current = null)}
      >
        <HangarDeck
          kitIds={SHIP_KIT_IDS}
          index={model.index}
          lockedIds={model.dots.filter((d) => d.locked).map((d) => d.id)}
        />
      </div>

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

      <div
        className="hangar-pager"
        role="status"
        aria-label={`Ship ${model.index + 1} of ${SHIP_KIT_IDS.length}: ${kit.name}${model.locked ? ', locked' : ''}`}
      >
        <span className="hangar-pager-count">{model.positionLabel}</span>
        <span className="hangar-pager-dots" aria-hidden="true">
          {model.dots.map((dot) => (
            <i key={dot.id} className={cn(dot.current && 'current', dot.locked && 'locked')} />
          ))}
        </span>
      </div>

      <div className="hangar-stagefill">
        {model.locked && (
          <div className="hangar-lock-callout">
            <Icon name="lock" />
            <span>Unlock at {model.unlockScore.toLocaleString()}</span>
          </div>
        )}
      </div>

      <div className="hangar-arrows" aria-hidden="true">
        <div
          className={cn('hangar-arrow', !model.canPageLeft && 'off')}
          onPointerDown={() => page(-1)}
        >
          <Chevron />
        </div>
        <div
          className={cn('hangar-arrow flip', !model.canPageRight && 'off')}
          onPointerDown={() => page(1)}
        >
          <Chevron />
        </div>
      </div>

      <Panel as="section" size="lg" className="hangar-info" aria-label={`${kit.name} details`}>
        <div className="hangar-info-id">
          <span className="hangar-info-mark">
            <Icon name={model.centeredId} />
          </span>
          <div className="hangar-info-copy">
            <div className="hangar-info-name">
              <strong>{kit.name}</strong>
              <small>{kit.role}</small>
            </div>
            <p className="muted hangar-info-blurb">{kit.blurb}</p>
            <div className="hangar-info-loadout">
              <span>{kit.weaponName}</span>
              <span>{kit.passiveLine}</span>
            </div>
          </div>
        </div>
        {model.locked ? (
          <div className="hangar-info-lock">
            <Icon name="lock" />
            <div>
              <small>Locked kit</small>
              <strong>Unlock at {model.unlockScore.toLocaleString()}</strong>
              <span>single-run career best</span>
            </div>
          </div>
        ) : (
          <div className="hangar-info-stats" aria-label={`${kit.name} attributes`}>
            <div>
              <small>Hull</small>
              <b>{kit.maxHp}</b>
              <Meter segments value={metricValue(kit.maxHp / 3)} aria-label="Hull" />
            </div>
            <div>
              <small>Mobility</small>
              <b>×{kit.moveMult}</b>
              <Meter segments value={metricValue(kit.moveMult / 1.25)} aria-label="Mobility" />
            </div>
            <div>
              <small>Profile</small>
              <b>{kit.hitboxR}</b>
              <Meter segments value={metricValue((0.42 - kit.hitboxR) / 0.14)} aria-label="Profile" />
            </div>
            <div>
              <small>Bombs</small>
              <b>{kit.startBombs}</b>
              <Meter segments value={metricValue(kit.startBombs / 3)} aria-label="Bombs" />
            </div>
          </div>
        )}
      </Panel>

      <div className="hangar-actions">
        <Button
          data-menu-primary
          variant="primary"
          icon="launch"
          onClick={launch}
          disabled={!model.launchable}
        >
          <span>
            Launch <small>{model.launchable ? kit.name : 'Locked'}</small>
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
