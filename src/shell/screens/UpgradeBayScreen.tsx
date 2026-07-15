import { useEffect, useRef, useState } from 'react'
import { useSessionStore } from '../../app/sessionStore'
import { playSfx, unlockAudio } from '../../audio/bus'
import {
  META_BRANCHES,
  META_BRANCH_LABELS,
  META_RANK_EFFECTS,
  nextMetaRankCost,
  type MetaBranch,
} from '../../sim/metaModifiers'
import { SignalIcon } from '../SignalIcon'

export function UpgradeBayScreen() {
  const meta = useSessionStore((s) => s.meta)
  const purchaseMetaRank = useSessionStore((s) => s.purchaseMetaRank)
  const setScreen = useSessionStore((s) => s.setScreen)
  const settings = useSessionStore((s) => s.settings)
  const [installed, setInstalled] = useState<MetaBranch | null>(null)
  const installTimer = useRef<number | null>(null)

  useEffect(() => () => {
    if (installTimer.current !== null) window.clearTimeout(installTimer.current)
  }, [])

  const buy = (branch: MetaBranch) => {
    unlockAudio()
    if (!purchaseMetaRank(branch)) return
    playSfx('ui_confirm', settings)
    setInstalled(branch)
    if (installTimer.current !== null) window.clearTimeout(installTimer.current)
    installTimer.current = window.setTimeout(() => setInstalled(null), 520)
  }

  return (
    <div className={`screen upgrade-bay-screen${settings.reducedMotion ? ' motion-reduced' : ''}`}>
      <header className="screen-header">
        <h2>Upgrade bay</h2>
        <div className="bay-header-meta">
          <span className="resource-chip is-scrap"><SignalIcon name="scrap" /><span><small>Available scrap</small><b>{meta.scrap.toLocaleString()}</b></span></span>
          <p className="screen-kicker">Permanent installs · Applies on next launch</p>
        </div>
      </header>
      <div className="bay-grid">
        {META_BRANCHES.map((branch) => {
          const rank = meta.ranks[branch]
          const cost = nextMetaRankCost(rank)
          const maxed = cost === null
          const canBuy = !maxed && meta.scrap >= cost
          const shortfall = maxed ? 0 : Math.max(0, cost - meta.scrap)
          const owned =
            rank <= 0 ? 'Baseline configuration' : META_RANK_EFFECTS[branch][rank - 1]!
          const next = maxed ? 'MAX' : META_RANK_EFFECTS[branch][rank]!

          return (
            <article key={branch} className={`bay-card is-${branch}${installed === branch ? ' is-installed' : ''}`}>
              <header className="bay-card-head">
                <span className="bay-branch-icon"><SignalIcon name={branch} /></span>
                <span><small>System branch</small><strong>{META_BRANCH_LABELS[branch]}</strong></span>
                <b className="bay-rank">0{rank}</b>
              </header>
              <div className="rank-rail" aria-label={`Rank ${rank} of 3`}>
                {Array.from({ length: 3 }, (_, index) => (
                  <span key={index} className={index < rank ? 'is-on' : ''}><i /></span>
                ))}
              </div>
              <div className="bay-effect is-owned"><small>Installed</small><span>{owned}</span></div>
              <div className="bay-effect is-next"><small>{maxed ? 'System state' : 'Next installation'}</small><strong>{next}</strong></div>
              <button type="button" className={canBuy ? 'buy-ready' : ''} disabled={!canBuy} onClick={() => buy(branch)}>
                <SignalIcon name={maxed ? 'upgrade' : 'scrap'} />
                <span>{maxed ? 'Fully installed' : shortfall > 0 ? `Need ${shortfall} scrap` : `Install · ${cost} scrap`}</span>
              </button>
              {installed === branch ? <span className="install-confirm" role="status">Installed</span> : null}
            </article>
          )
        })}
      </div>
      <div className="bay-actions"><button type="button" className="tertiary-action" onClick={() => setScreen('hangar')}><SignalIcon name="back" /> Back to hangar</button></div>
    </div>
  )
}
