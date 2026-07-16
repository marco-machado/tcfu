import { useEffect, useRef, useState } from 'react'
import { useSessionStore } from '../sessionStore'
import { COMBO_WINDOW, comboMultiplier, DEATH_HOLD, scrapForRun } from '../../sim/constants'
import { scrapEarnMultFromRanks } from '../../sim/metaModifiers'
import { isSetPieceWave } from '../../sim/patterns'
import { bossBarFromWorld } from '../../sim/step'
import { getWorld } from '../../sim/world'
import {
  nextWeaponTierThreshold,
  weaponTierFloor,
  weaponTierForWCells,
  WEAPON_TIER_MAX,
} from '../../sim/weapons'
import { presentationFxState } from '../../presentation/fxState'
import { PauseModal } from './PauseModal'
import { TouchControls } from './TouchControls'
import { queueTouchPause } from '../../input/sample'
import { Chip, Icon, IconButton, Label, Meter, Modal, Panel, PipRow, cn, type IconName } from '../components/ui'
import { corridorBottomWidthPx } from '../../view/corridorFraming'

const POWERUP_EXPIRING_SEC = 2.5

type TimedPowerup = { key: string; name: string; icon: IconName; remaining: number }

function timedPowerups(rateUp: number, spreadUp: number, scoreMult: number): TimedPowerup[] {
  const list: TimedPowerup[] = []
  if (rateUp > 0) list.push({ key: 'overclock', name: 'Overclock', icon: 'overclock', remaining: rateUp })
  if (spreadUp > 0) list.push({ key: 'options', name: 'Options', icon: 'options', remaining: spreadUp })
  if (scoreMult > 0) list.push({ key: 'bounty', name: 'Bounty', icon: 'bounty', remaining: scoreMult })
  return list
}

type Banner = { key: string; kind: 'clear' | 'warning' | 'tier'; title: string; sub?: string }

export function RunHud() {
  const [, tick] = useState(0)
  const metaRanks = useSessionStore((s) => s.meta.ranks)
  const waveFlashRef = useRef({ wave: 0, until: 0 })
  const hudRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const id = window.setInterval(() => tick((n) => n + 1), 50)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    const el = hudRef.current
    if (!el) return
    const apply = () => {
      const width = corridorBottomWidthPx(el.clientWidth, el.clientHeight)
      el.style.setProperty('--corridor-bottom-w', `${width}px`)
    }
    apply()
    const observer = new ResizeObserver(apply)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const w = getWorld()
  const p = w.player
  const s = w.session
  const fx = presentationFxState
  const wavesCompleted = Math.max(0, s.wave - 1)
  const scrapEst = scrapForRun(s.score, wavesCompleted, scrapEarnMultFromRanks(metaRanks))
  const dying = s.runOver && s.endHold > 0
  // Let the authored crash beat own the frame before the fail-state modal arrives.
  const showDeathModal = dying && s.deathFlash <= DEATH_HOLD - 0.6

  const weaponTier = weaponTierForWCells(p.wCells)
  const nextTier = nextWeaponTierThreshold(p.wCells)
  const maxTier = nextTier === null
  const tierFloor = weaponTierFloor(weaponTier)
  const wCellPct = maxTier
    ? 1
    : Math.max(0, Math.min(1, (p.wCells - tierFloor) / (nextTier - tierFloor)))

  const powerups = timedPowerups(p.rateUp, p.spreadUp, p.scoreMult)
  const boss = bossBarFromWorld(w)
  const bossPct = boss && boss.maxHp > 0 ? Math.max(0, Math.min(1, boss.hp / boss.maxHp)) : 0
  const damageCue = fx.hudDamage > 0
  const shieldBreakCue = fx.hudShieldBreak > 0
  const lifeLossCue = fx.hudLifeLoss > 0
  const grazeCue = fx.hudGraze > 0

  // New wave banner: flash for 1.6s when the wave counter changes
  const nowMs = performance.now()
  if (waveFlashRef.current.wave !== s.wave) {
    waveFlashRef.current = { wave: s.wave, until: nowMs + 1600 }
  }

  const bossApproaching =
    isSetPieceWave(s.wave) &&
    w.enemies.some((e) => e.active && e.kind === 'colossus' && e.y > 13.5)

  let banner: Banner | null = null
  if (fx.hudWaveClear > 0) {
    banner = { key: 'clear', kind: 'clear', title: 'Wave clear', sub: 'Bonus salvage secured' }
  } else if (bossApproaching) {
    banner = { key: 'boss', kind: 'warning', title: 'Colossus inbound', sub: 'Set piece — hold the band' }
  } else if (fx.hudTierUp > 0) {
    banner = { key: 'tier', kind: 'tier', title: `Weapon tier ${weaponTier}`, sub: 'Lance output increased' }
  } else if (nowMs < waveFlashRef.current.until && s.wave > 1 && !s.runOver) {
    banner = { key: `wave-${s.wave}`, kind: 'tier', title: `Wave ${s.wave}`, sub: undefined }
  }

  const comboActive = s.combo >= 2 && !s.runOver
  const comboPct = Math.max(0, Math.min(1, s.comboTimer / COMBO_WINDOW))
  const waveProgress =
    w.waves.waveSpawned > 0 ? Math.min(1, w.waves.waveKilled / w.waves.waveSpawned) : 0

  const pauseGame = () => {
    if (!s.runOver) queueTouchPause()
  }

  return (
    <div className="hud" ref={hudRef}>
      <div className="hud-top">
        <Panel
          size="sm"
          className={cn('score-cluster', 'hud-module', grazeCue && 'is-grazing')}
          aria-label="Score"
        >
          <div className="score-main">
            <Label>Score</Label>
            <strong className="hud-number score-value">{Math.floor(s.score)}</strong>
          </div>
          <div className="score-side">
            <span className="score-kills">Kills <b className="hud-number">{s.kills}</b></span>
            <span className={cn('score-graze', grazeCue && 'is-hot')}>Graze <b className="hud-number">{s.grazes}</b></span>
          </div>
          <div
            className={cn('combo-badge', comboActive && 'is-live', fx.hudComboBreak > 0 && 'is-broken')}
            aria-label="Kill chain"
          >
            {comboActive ? (
              <>
                <span className="combo-mult hud-number">×{comboMultiplier(s.combo).toFixed(2)}</span>
                <span className="combo-count">chain {s.combo}</span>
                <Meter tone="salvage" value={comboPct} aria-label="Kill chain timer" />
              </>
            ) : (
              <span className="combo-idle">{fx.hudComboBreak > 0 ? 'Chain lost' : 'No chain'}</span>
            )}
          </div>
        </Panel>

        <div className="hud-top-right">
          <Panel size="sm" className="wave-cluster hud-module" aria-label="Wave progress">
            <div className="wave-heading">
              <Label>Wave</Label>
              <strong className="hud-number wave-value">{s.wave}</strong>
            </div>
            <Meter
              tone="signal"
              value={waveProgress}
              aria-label="Wave hostiles down"
              aria-valuemin={0}
              aria-valuemax={1}
              aria-valuenow={waveProgress}
            />
          </Panel>
          <IconButton icon="pause" label="Pause" onClick={pauseGame} />
        </div>
      </div>

      <div className="hud-mid">
        {banner ? (
          <div key={banner.key} className={`run-banner is-${banner.kind}`} role="status">
            <strong>{banner.title}</strong>
            {banner.sub ? <span>{banner.sub}</span> : null}
          </div>
        ) : null}
        {boss ? (
          <div className="boss-bar" aria-label="Set-piece health">
            <div className="boss-head">
              <span className="boss-name">Colossus</span>
              <span className="boss-hp hud-number">{Math.ceil(boss.hp)}/{boss.maxHp}</span>
            </div>
            <Meter
              tone="threat"
              segments
              value={bossPct}
              aria-label="Colossus hull integrity"
              aria-valuemin={0}
              aria-valuemax={boss.maxHp}
              aria-valuenow={Math.ceil(boss.hp)}
            />
          </div>
        ) : null}
      </div>

      {powerups.length > 0 ? (
        <aside className="hud-status-rail" aria-label="Timed powerups">
          {powerups.map((pu) => {
            const expiring = pu.remaining <= POWERUP_EXPIRING_SEC
            return (
              <Chip key={pu.key} tone={expiring ? 'expiring' : 'default'} className="powerup-badge">
                <span className="powerup-glyph"><Icon name={pu.icon} /></span>
                <span className="powerup-name">{pu.name}</span>
                <span className="powerup-timer hud-number">{pu.remaining.toFixed(1)}s</span>
              </Chip>
            )
          })}
        </aside>
      ) : null}

      <div className="hud-bottom">
        <Panel
          as="section"
          size="sm"
          className={cn(
            'survival-cluster',
            'hud-module',
            damageCue && 'is-damaged',
            shieldBreakCue && 'is-shield-hit',
            lifeLossCue && 'is-life-lost',
          )}
          aria-label="Survival status"
        >
          <div className="hull-row">
            <Label className="icon-label"><Icon name="hull" /> Hull</Label>
            <PipRow
              shape="segment"
              tone="signal"
              count={p.maxHp}
              filled={Math.max(0, p.hp)}
              role="meter"
              aria-label="Hull integrity"
              aria-valuemin={0}
              aria-valuemax={p.maxHp}
              aria-valuenow={Math.max(0, p.hp)}
            />
            <span
              className={cn('shield-chip', p.shield && 'is-active')}
              aria-label={p.shield ? 'Shield ready' : 'Shield offline'}
            >
              <Icon name="shield" />
            </span>
          </div>
          <div className="lives-row" aria-label={`${p.lives} lives`}>
            <Label className="icon-label"><Icon name="wing" /> Wings</Label>
            <PipRow icon="wing" tone="signal" count={3} filled={p.lives} aria-label={`${p.lives} lives`} />
            <span className="scrap-est"><Icon name="scrap" /> Scrap <b className="hud-number">~{scrapEst}</b></span>
          </div>
        </Panel>

        <Panel as="section" size="sm" className="weapons-cluster hud-module" aria-label="Weapons status">
          <div className="tier-row">
            <Label className="icon-label"><Icon name="lance" /> Lance</Label>
            <PipRow
              shape="diamond"
              tone="signal"
              count={WEAPON_TIER_MAX}
              filled={weaponTier}
              aria-label={`Weapon tier ${weaponTier} of ${WEAPON_TIER_MAX}`}
            />
            <PipRow
              className="bomb-pips"
              icon="bomb"
              tone="salvage"
              count={p.maxBombs}
              filled={p.bombs}
              aria-label={`${p.bombs} of ${p.maxBombs} bombs`}
            />
          </div>
          <div className="wcell-row">
            <Icon name="wcell" className="wcell-icon" />
            <Meter
              tone={maxTier ? 'repair' : 'signal'}
              value={wCellPct}
              aria-label="W-cell progress to next tier"
              aria-valuemin={maxTier ? 0 : tierFloor}
              aria-valuemax={maxTier ? p.wCells : nextTier}
              aria-valuenow={p.wCells}
            />
            <span className="wcell-frac hud-number">{maxTier ? 'MAX' : `${p.wCells}/${nextTier}`}</span>
          </div>
        </Panel>
      </div>

      <TouchControls />

      {s.paused && !dying && <PauseModal />}
      {showDeathModal && (
        <Modal
          overlayTone="death"
          tone="danger"
          role="alertdialog"
          aria-labelledby="destroyed-title"
          title="Destroyed"
          titleId="destroyed-title"
          sub="Run over · salvaging wreckage…"
        />
      )}
    </div>
  )
}
