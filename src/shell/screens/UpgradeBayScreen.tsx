import { useSessionStore } from '../../app/sessionStore'
import {
  META_BRANCHES,
  META_BRANCH_LABELS,
  META_RANK_EFFECTS,
  nextMetaRankCost,
  type MetaBranch,
} from '../../sim/metaModifiers'

function rankPips(rank: number): string {
  return '●'.repeat(rank) + '○'.repeat(3 - rank)
}

export function UpgradeBayScreen() {
  const meta = useSessionStore((s) => s.meta)
  const purchaseMetaRank = useSessionStore((s) => s.purchaseMetaRank)
  const setScreen = useSessionStore((s) => s.setScreen)

  const buy = (branch: MetaBranch) => {
    purchaseMetaRank(branch)
  }

  return (
    <div className="screen">
      <h2>Upgrade bay</h2>
      <p className="muted">Scrap {meta.scrap} · No refunds · Applies on next Launch</p>
      <div className="bay-grid">
        {META_BRANCHES.map((branch) => {
          const rank = meta.ranks[branch]
          const cost = nextMetaRankCost(rank)
          const maxed = cost === null
          const canBuy = !maxed && meta.scrap >= cost
          const owned =
            rank <= 0 ? 'No ranks owned' : META_RANK_EFFECTS[branch][rank - 1]!
          const next = maxed ? 'MAX' : META_RANK_EFFECTS[branch][rank]!

          return (
            <div key={branch} className="bay-card">
              <strong>{META_BRANCH_LABELS[branch]}</strong>
              <div className="muted">Rank {rankPips(rank)}</div>
              <div className="muted bay-effect">Owned: {owned}</div>
              <div className="muted bay-effect">Next: {next}</div>
              <button type="button" disabled={!canBuy} onClick={() => buy(branch)}>
                {maxed ? 'MAX' : `Buy · ${cost} Scrap`}
              </button>
            </div>
          )
        })}
      </div>
      <button type="button" onClick={() => setScreen('hangar')}>
        Back
      </button>
    </div>
  )
}
