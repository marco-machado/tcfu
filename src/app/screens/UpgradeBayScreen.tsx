import { useEffect, useRef, useState } from 'react'
import { useSessionStore } from '../sessionStore'
import { playSfx, unlockAudio } from '../../audio/bus'
import { useMenuFocus } from '../menuFocus/useMenuFocus'
import {
  META_BRANCHES,
  META_BRANCH_LABELS,
  META_RANK_EFFECTS,
  nextMetaRankCost,
  type MetaBranch,
} from '../../sim/metaModifiers'
import { Button, Chip, Icon, Label, Panel, PipRow, ScreenHeader, cn } from '../components/ui'

export function UpgradeBayScreen() {
  const meta = useSessionStore((s) => s.meta)
  const purchaseMetaRank = useSessionStore((s) => s.purchaseMetaRank)
  const setScreen = useSessionStore((s) => s.setScreen)
  const settings = useSessionStore((s) => s.settings)
  const [installed, setInstalled] = useState<MetaBranch | null>(null)
  const installTimer = useRef<number | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  useMenuFocus({ rootRef, onBack: () => setScreen('hangar') })

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
    <div
      className={`screen screen--wide upgrade-bay-screen${settings.reducedMotion ? ' motion-reduced' : ''}`}
      ref={rootRef}
    >
      <ScreenHeader title="Upgrade bay">
        <div className="bay-header-meta">
          <Chip tone="scrap" icon="scrap" className="resource-chip">
            <span>
              <small>Available scrap</small>
              <b>{meta.scrap.toLocaleString()}</b>
            </span>
          </Chip>
          <Label variant="kicker">Permanent installs · Applies on next launch</Label>
        </div>
      </ScreenHeader>
      <div className="bay-grid">
        {META_BRANCHES.map((branch, branchIndex) => {
          const rank = meta.ranks[branch]
          const cost = nextMetaRankCost(rank)
          const maxed = cost === null
          const canBuy = !maxed && meta.scrap >= cost
          const shortfall = maxed ? 0 : Math.max(0, cost - meta.scrap)
          const owned =
            rank <= 0 ? 'Baseline configuration' : META_RANK_EFFECTS[branch][rank - 1]!
          const next = maxed ? 'MAX' : META_RANK_EFFECTS[branch][rank]!

          return (
            <Panel
              as="article"
              key={branch}
              className={cn('bay-card', `is-${branch}`, installed === branch && 'is-installed')}
            >
              <header className="bay-card-head">
                <span className="bay-branch-icon">
                  <Icon name={branch} />
                </span>
                <span>
                  <small>System branch</small>
                  <strong>{META_BRANCH_LABELS[branch]}</strong>
                </span>
                <b className="bay-rank">0{rank}</b>
              </header>
              <PipRow
                className="rank-rail"
                shape="diamond"
                count={3}
                filled={rank}
                aria-label={`Rank ${rank} of 3`}
              />
              <div className="bay-effect is-owned">
                <small>Installed</small>
                <span>{owned}</span>
              </div>
              <div className="bay-effect is-next">
                <small>{maxed ? 'System state' : 'Next installation'}</small>
                <strong>{next}</strong>
              </div>
              <Button
                data-menu-primary={branchIndex === 0 || undefined}
                className={cn(canBuy && 'buy-ready')}
                icon={maxed ? 'upgrade' : 'scrap'}
                aria-disabled={!canBuy || undefined}
                onClick={() => canBuy && buy(branch)}
              >
                <span>
                  {maxed
                    ? 'Fully installed'
                    : shortfall > 0
                      ? `Need ${shortfall} scrap`
                      : `Install · ${cost} scrap`}
                </span>
              </Button>
              {installed === branch ? (
                <span className="install-confirm" role="status">
                  Installed
                </span>
              ) : null}
            </Panel>
          )
        })}
      </div>
      <div className="screen-actions">
        <Button variant="tertiary" icon="back" onClick={() => setScreen('hangar')}>
          Back to hangar
        </Button>
      </div>
    </div>
  )
}
