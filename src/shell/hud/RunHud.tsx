import { useEffect, useRef, useState } from 'react'
import { useSessionStore } from '../../app/sessionStore'
import { COMBO_WINDOW, comboMultiplier, scrapForRun } from '../../sim/constants'
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

const POWERUP_EXPIRING_SEC = 2.5

type TimedPowerup = { key: string; name: string; glyph: string; remaining: number }

function timedPowerups(rateUp: number, spreadUp: number, scoreMult: number): TimedPowerup[] {
  const list: TimedPowerup[] = []
  if (rateUp > 0) list.push({ key: 'overclock', name: 'Overclock', glyph: 'O', remaining: rateUp })
  if (spreadUp > 0) list.push({ key: 'options', name: 'Options', glyph: 'V', remaining: spreadUp })
  if (scoreMult > 0) list.push({ key: 'bounty', name: 'Bounty', glyph: 'B', remaining: scoreMult })
  return list
}

type Banner = { key: string; kind: 'clear' | 'warning' | 'tier'; title: string; sub?: string }

export function RunHud() {
  const [, tick] = useState(0)
  const metaRanks = useSessionStore((s) => s.meta.ranks)
  const waveFlashRef = useRef({ wave: 0, until: 0 })

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
  const fx = presentationFxState
  const wavesCompleted = Math.max(0, s.wave - 1)
  const scrapEst = scrapForRun(s.score, wavesCompleted, scrapEarnMultFromRanks(metaRanks))
  const dying = s.runOver && s.endHold > 0

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
    <div className="hud">
      <div className="hud-top">
        <div className={`score-cluster hud-module${grazeCue ? ' is-grazing' : ''}`} aria-label="Score">
          <div className="score-main">
            <span className="hud-label">Score</span>
            <strong className="hud-number score-value">{Math.floor(s.score)}</strong>
          </div>
          <div className="score-side">
            <span className="score-kills">Kills <b className="hud-number">{s.kills}</b></span>
            <span className={`score-graze${grazeCue ? ' is-hot' : ''}`}>Graze <b className="hud-number">{s.grazes}</b></span>
          </div>
          <div className={`combo-badge${comboActive ? ' is-live' : ''}${fx.hudComboBreak > 0 ? ' is-broken' : ''}`} aria-label="Kill chain">
            {comboActive ? (
              <>
                <span className="combo-mult hud-number">×{comboMultiplier(s.combo).toFixed(2)}</span>
                <span className="combo-count">chain {s.combo}</span>
                <span className="combo-track"><span className="combo-fill" style={{ width: `${comboPct * 100}%` }} /></span>
              </>
            ) : (
              <span className="combo-idle">{fx.hudComboBreak > 0 ? 'Chain lost' : 'No chain'}</span>
            )}
          </div>
        </div>

        <div className="hud-top-right">
          <div className="wave-cluster hud-module" aria-label="Wave progress">
            <div className="wave-heading">
              <span className="hud-label">Wave</span>
              <strong className="hud-number wave-value">{s.wave}</strong>
            </div>
            <div className="wave-track" role="meter" aria-label="Wave hostiles down" aria-valuemin={0} aria-valuemax={1} aria-valuenow={waveProgress}>
              <span className="wave-fill" style={{ width: `${waveProgress * 100}%` }} />
            </div>
          </div>
          <button
            type="button"
            className="hud-icon-btn"
            aria-label="Pause"
            onClick={pauseGame}
          >
            <span className="pause-glyph" aria-hidden="true" />
          </button>
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
            <div
              className="boss-track"
              role="meter"
              aria-label="Colossus hull integrity"
              aria-valuemin={0}
              aria-valuemax={boss.maxHp}
              aria-valuenow={Math.ceil(boss.hp)}
            >
              <div className="boss-fill" style={{ width: `${bossPct * 100}%` }} />
            </div>
          </div>
        ) : null}
        {powerups.length > 0 ? (
          <div className="powerup-row" aria-label="Timed powerups">
            {powerups.map((pu) => {
              const expiring = pu.remaining <= POWERUP_EXPIRING_SEC
              return (
                <div key={pu.key} className={`powerup-badge${expiring ? ' is-expiring' : ''}`}>
                  <span className="powerup-glyph" aria-hidden="true">{pu.glyph}</span>
                  <span className="powerup-name">{pu.name}</span>
                  <span className="powerup-timer hud-number">{pu.remaining.toFixed(1)}s</span>
                </div>
              )
            })}
          </div>
        ) : null}
      </div>

      <div className="hud-bottom">
        <section
          className={`survival-cluster hud-module${damageCue ? ' is-damaged' : ''}${shieldBreakCue ? ' is-shield-hit' : ''}${lifeLossCue ? ' is-life-lost' : ''}`}
          aria-label="Survival status"
        >
          <div className="hull-row">
            <span className="hud-label">Hull</span>
            <div className="hull-segments" role="meter" aria-label="Hull integrity" aria-valuemin={0} aria-valuemax={p.maxHp} aria-valuenow={Math.max(0, p.hp)}>
              {Array.from({ length: p.maxHp }, (_, i) => (
                <span key={i} className={`hull-seg${i < p.hp ? ' on' : ''}`} />
              ))}
            </div>
            <span className={`shield-chip${p.shield ? ' is-active' : ''}`} aria-label={p.shield ? 'Shield ready' : 'Shield offline'}>
              <span className="shield-icon" aria-hidden="true" />
            </span>
          </div>
          <div className="lives-row" aria-label={`${p.lives} lives`}>
            <span className="hud-label">Wings</span>
            <span className="life-pips" aria-hidden="true">
              {Array.from({ length: 3 }, (_, i) => (
                <span key={i} className={`life-pip${i < p.lives ? ' on' : ''}`} />
              ))}
            </span>
            <span className="scrap-est">Scrap <b className="hud-number">~{scrapEst}</b></span>
          </div>
        </section>

        <section className="weapons-cluster hud-module" aria-label="Weapons status">
          <div className="tier-row">
            <span className="hud-label">Lance</span>
            <span className="tier-pips" aria-label={`Weapon tier ${weaponTier} of ${WEAPON_TIER_MAX}`}>
              {Array.from({ length: WEAPON_TIER_MAX }, (_, i) => (
                <span key={i} className={i < weaponTier ? 'on' : ''} />
              ))}
            </span>
            <span className="bomb-pips" aria-label={`${p.bombs} of ${p.maxBombs} bombs`}>
              {Array.from({ length: p.maxBombs }, (_, i) => (
                <span key={i} className={`bomb-pip${i < p.bombs ? ' on' : ''}`}>✦</span>
              ))}
            </span>
          </div>
          <div className="wcell-row">
            <div
              className={`wcell-track${maxTier ? ' is-max' : ''}`}
              role="meter"
              aria-label="W-cell progress to next tier"
              aria-valuemin={maxTier ? 0 : tierFloor}
              aria-valuemax={maxTier ? p.wCells : nextTier}
              aria-valuenow={p.wCells}
            >
              <div className="wcell-fill" style={{ width: `${wCellPct * 100}%` }} />
            </div>
            <span className="wcell-frac hud-number">{maxTier ? 'MAX' : `${p.wCells}/${nextTier}`}</span>
          </div>
        </section>
      </div>

      <TouchControls />

      {s.paused && !dying && <PauseModal />}
      {dying && (
        <div className="overlay death-overlay">
          <div className="modal death-modal" role="alertdialog" aria-labelledby="destroyed-title">
            <h2 id="destroyed-title">Destroyed</h2>
            <p className="modal-sub">Run over · salvaging wreckage…</p>
          </div>
        </div>
      )}
    </div>
  )
}
