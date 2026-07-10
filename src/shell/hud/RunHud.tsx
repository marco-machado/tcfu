import { useEffect, useRef, useState } from 'react'
import { useSessionStore } from '../../app/sessionStore'
import { scrapForRun } from '../../sim/constants'
import { scrapEarnMultFromRanks } from '../../sim/metaModifiers'
import { bossBarFromWorld } from '../../sim/step'
import { getWorld } from '../../sim/world'
import { nextWeaponTierThreshold, weaponTierFloor, weaponTierForWCells, WEAPON_TIER_MAX } from '../../sim/weapons'
import { presentationFxState } from '../../presentation/fxState'
import { PauseModal } from './PauseModal'

const TIER_UP_FLASH_SEC = 1.4
const POWERUP_EXPIRING_SEC = 2.5

type TimedPowerup = { key: string; name: string; glyph: string; remaining: number }

function timedPowerups(rateUp: number, spreadUp: number, scoreMult: number): TimedPowerup[] {
  const list: TimedPowerup[] = []
  if (rateUp > 0) list.push({ key: 'overclock', name: 'Overclock', glyph: 'O', remaining: rateUp })
  if (spreadUp > 0) list.push({ key: 'options', name: 'Options', glyph: 'V', remaining: spreadUp })
  if (scoreMult > 0) list.push({ key: 'bounty', name: 'Bounty', glyph: 'B', remaining: scoreMult })
  return list
}

export function RunHud() {
  const [, tick] = useState(0)
  const metaRanks = useSessionStore((s) => s.meta.ranks)
  const prevTierRef = useRef<number | null>(null)
  const tierFlashRef = useRef(0)

  useEffect(() => {
    let id = 0
    let last = performance.now()
    const loop = () => {
      const now = performance.now()
      const dt = Math.min(0.1, Math.max(0, (now - last) / 1000))
      last = now
      const tier = weaponTierForWCells(getWorld().player.wCells)
      if (prevTierRef.current === null) prevTierRef.current = tier
      if (tier > prevTierRef.current) tierFlashRef.current = TIER_UP_FLASH_SEC
      if (tier < prevTierRef.current) tierFlashRef.current = 0
      prevTierRef.current = tier
      tierFlashRef.current = Math.max(0, tierFlashRef.current - dt)
      tick((n) => n + 1)
      id = requestAnimationFrame(loop)
    }
    id = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(id)
  }, [])

  const w = getWorld()
  const p = w.player
  const s = w.session
  const wavesCompleted = Math.max(0, s.wave - 1)
  const scrapEst = scrapForRun(s.score, wavesCompleted, scrapEarnMultFromRanks(metaRanks))
  const dying = s.runOver && s.endHold > 0

  const weaponTier = weaponTierForWCells(p.wCells)
  const nextTier = nextWeaponTierThreshold(p.wCells)
  const tierUpCue = tierFlashRef.current > 0
  const maxTier = nextTier === null
  const tierFloor = weaponTierFloor(weaponTier)
  const wCellPct = maxTier
    ? 1
    : Math.max(0, Math.min(1, (p.wCells - tierFloor) / (nextTier - tierFloor)))

  const powerups = timedPowerups(p.rateUp, p.spreadUp, p.scoreMult)
  const boss = bossBarFromWorld(w)
  const bossPct = boss && boss.maxHp > 0 ? Math.max(0, Math.min(1, boss.hp / boss.maxHp)) : 0
  const hpPct = p.maxHp > 0 ? Math.max(0, Math.min(1, p.hp / p.maxHp)) : 0
  const damageCue = presentationFxState.hudDamage > 0
  const shieldBreakCue = presentationFxState.hudShieldBreak > 0
  const lifeLossCue = presentationFxState.hudLifeLoss > 0

  return (
    <div className="hud">
      <div className="hud-top" aria-label="Run progress">
        <div className="hud-score hud-module">
          <span className="hud-label">Score</span>
          <strong className="hud-number hud-score-value">{Math.floor(s.score)}</strong>
          <span className="hud-secondary">Kills <b className="hud-number">{s.kills}</b></span>
        </div>
        <div className="hud-wave hud-module">
          <span className="hud-label">Wave</span>
          <strong className="hud-number hud-wave-value">{s.wave}</strong>
        </div>
      </div>
      <div className="hud-mid">
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
          <div className="hp-heading">
            <span className="hud-label">Hull</span>
            <strong className="hp-value"><span className="hud-number">{Math.max(0, p.hp)}</span><small>/{p.maxHp}</small></strong>
          </div>
          <div className="hp-track" role="meter" aria-label="Hull integrity" aria-valuemin={0} aria-valuemax={p.maxHp} aria-valuenow={Math.max(0, p.hp)}>
            <span className="hp-fill" style={{ width: `${hpPct * 100}%` }} />
          </div>
          <div className="survival-details">
            <span className="lives-status"><span aria-hidden="true">◆</span> Lives <b className="hud-number">{p.lives}</b></span>
            <span className={`shield-status${p.shield ? ' is-active' : ' is-offline'}`}>
              <span className="shield-icon" aria-hidden="true" />
              {shieldBreakCue ? 'Shield absorbed hit' : p.shield ? 'Shield ready' : 'Shield offline'}
            </span>
          </div>
        </section>
        <div className="hud-resources">
          <div className={`bomb-status hud-module${p.bombs === 0 ? ' is-empty' : ''}`} aria-label={`${p.bombs} bombs available`}>
            <span className="bomb-icon" aria-hidden="true">✦</span>
            <span><span className="hud-label">Bombs</span><strong className="hud-number">{p.bombs}</strong></span>
            {p.bombs === 0 ? <em>Empty</em> : <kbd>Shift</kbd>}
          </div>
          <div
            key={`tier-${weaponTier}`}
            className={`hud-economy hud-module${maxTier ? ' is-max' : ''}${tierUpCue ? ' is-tier-up' : ''}`}
            aria-label="Run economy"
          >
            <div className="economy-row">
              <span className="economy-scrap">Scrap <b className="hud-number">~{scrapEst}</b></span>
              <span className="economy-tier" aria-label={`Weapon tier ${weaponTier} of ${WEAPON_TIER_MAX}`}>
                Tier
                <span className="tier-pips" aria-hidden="true">
                  {Array.from({ length: WEAPON_TIER_MAX }, (_, i) => (
                    <span key={i} className={i < weaponTier ? 'on' : ''} />
                  ))}
                </span>
              </span>
            </div>
            <div className="wcell-row">
              <span className="hud-label">W-cells</span>
              <div
                className="wcell-track"
                role="meter"
                aria-label="W-cell progress to next run upgrade"
                aria-valuemin={maxTier ? 0 : tierFloor}
                aria-valuemax={maxTier ? p.wCells : nextTier}
                aria-valuenow={p.wCells}
              >
                <div className="wcell-fill" style={{ width: `${wCellPct * 100}%` }} />
              </div>
              <span className="wcell-frac hud-number">{maxTier ? 'MAX' : `${p.wCells}/${nextTier}`}</span>
            </div>
          </div>
        </div>
      </div>
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
