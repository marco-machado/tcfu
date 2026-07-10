import { useEffect, useState } from 'react'
import { useSessionStore } from '../../app/sessionStore'
import { scrapForRun } from '../../sim/constants'
import { scrapEarnMultFromRanks } from '../../sim/metaModifiers'
import { bossBarFromWorld } from '../../sim/step'
import { getWorld } from '../../sim/world'
import { nextWeaponTierThreshold, weaponTierForWCells, WEAPON_TIER_MAX } from '../../sim/weapons'
import { presentationFxState } from '../../presentation/fxState'

export function RunHud() {
  const [, tick] = useState(0)
  const metaRanks = useSessionStore((s) => s.meta.ranks)

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
  const wavesCompleted = Math.max(0, s.wave - 1)
  const scrapEst = scrapForRun(s.score, wavesCompleted, scrapEarnMultFromRanks(metaRanks))
  const dying = s.runOver && s.endHold > 0
  const nextTier = nextWeaponTierThreshold(p.wCells)
  const weaponTier = weaponTierForWCells(p.wCells)
  const tierPips = '●'.repeat(weaponTier) + '○'.repeat(WEAPON_TIER_MAX - weaponTier)
  const timed: string[] = []
  if (p.rateUp > 0) timed.push(`OVR ${p.rateUp.toFixed(1)}s`)
  if (p.spreadUp > 0) timed.push(`OPT ${p.spreadUp.toFixed(1)}s`)
  if (p.scoreMult > 0) timed.push(`BTY ${p.scoreMult.toFixed(1)}s`)
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
          <div className="boss-bar">
            <span className="boss-label">
              COLOSSUS {Math.ceil(boss.hp)}/{boss.maxHp}
            </span>
            <div className="boss-track">
              <div className="boss-fill" style={{ width: `${bossPct * 100}%` }} />
            </div>
          </div>
        ) : null}
        {timed.length > 0 ? <span className="hud-timed">{timed.join(' · ')}</span> : null}
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
          <span className="hud-economy hud-module">
          SCRAP ~{scrapEst} · TIER {tierPips} · W-CELLS {p.wCells}
          {nextTier === null ? ' · MAX' : ` / ${nextTier}`}
          </span>
        </div>
      </div>
      {s.paused && !dying && (
        <div className="overlay">
          <div className="panel">
            <h2>Paused</h2>
            <p className="muted">Press Esc / P or Start to resume</p>
          </div>
        </div>
      )}
      {dying && (
        <div className="overlay death-overlay">
          <div className="panel death-panel">
            <h2>Destroyed</h2>
            <p className="muted">Run over · salvaging wreckage…</p>
          </div>
        </div>
      )}
    </div>
  )
}
