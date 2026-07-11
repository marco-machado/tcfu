import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { isDebugMode, useDebugStore } from '../app/debugMode'
import {
  debugAddScore,
  debugAdjustBombs,
  debugAdjustHp,
  debugAdjustLives,
  debugAdjustWeaponTier,
  debugClearAll,
  debugIsGodMode,
  debugJumpToWave,
  debugKillPlayer,
  debugSetGodMode,
  debugSetPaused,
  debugSetShield,
  debugSpawnEnemy,
  debugSpawnPowerup,
  debugStepOneFrame,
  debugSuspendWaves,
  debugTriggerPattern,
} from '../sim/debugActions'
import { ALL_PATTERN_IDS } from '../sim/patterns'
import { weaponTierForWCells } from '../sim/weapons'
import { getWorld } from '../sim/world'
import { ENEMY_KINDS, POWERUP_TYPES, type ScreenId } from '../sim/types'

const TIME_SCALES = [0.25, 0.5, 1, 2]
const POLL_MS = 250

const panelStyle: CSSProperties = {
  position: 'absolute',
  top: 8,
  right: 8,
  bottom: 8,
  width: 240,
  overflowY: 'auto',
  background: 'rgba(6, 10, 18, 0.92)',
  border: '1px solid #2a4a68',
  borderRadius: 6,
  color: '#cfeaff',
  font: '12px monospace',
  padding: 8,
  zIndex: 40,
  pointerEvents: 'auto',
}

const rowStyle: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }
const headStyle: CSSProperties = { margin: '8px 0 4px', color: '#7cc8e8', fontWeight: 'bold' }

function Btn({ label, onClick, on }: { label: string; onClick: () => void; on?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: on ? '#2a4a68' : '#0d1826',
        color: '#cfeaff',
        border: '1px solid #2a4a68',
        borderRadius: 4,
        padding: '2px 6px',
        font: '11px monospace',
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  )
}

/** Re-renders on an interval, but only when the displayed world snapshot changed. */
function useWorldSnapshot(snapshot: () => string): void {
  const snapRef = useRef(snapshot)
  snapRef.current = snapshot
  const [, setSnap] = useState('')
  useEffect(() => {
    const poll = window.setInterval(
      () =>
        setSnap((prev) => {
          const next = snapRef.current()
          return next === prev ? prev : next
        }),
      POLL_MS,
    )
    return () => window.clearInterval(poll)
  }, [])
}

export function DebugBadge() {
  const hidden = useDebugStore((s) => s.hidden)
  if (!isDebugMode() || hidden) return null
  return (
    <div
      style={{
        position: 'absolute',
        top: 8,
        left: 8,
        zIndex: 40,
        background: '#7a1f1f',
        color: '#ffdede',
        font: 'bold 11px monospace',
        padding: '2px 8px',
        borderRadius: 4,
        letterSpacing: 1,
        pointerEvents: 'none',
      }}
    >
      DEBUG
    </div>
  )
}

/** Entity counts shown while the sim overlay is on, panel open or not. */
export function DebugCounts() {
  const overlay = useDebugStore((s) => s.overlay)
  const hidden = useDebugStore((s) => s.hidden)
  useWorldSnapshot(() => {
    const w = getWorld()
    return [
      w.enemies.filter((e) => e.active).length,
      w.enemyBullets.filter((b) => b.active).length,
      w.playerBullets.filter((b) => b.active).length,
      w.powerups.filter((p) => p.active).length,
    ].join(',')
  })
  if (!isDebugMode() || hidden || !overlay) return null
  const world = getWorld()
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 8,
        left: 8,
        zIndex: 40,
        background: 'rgba(6, 10, 18, 0.85)',
        color: '#cfeaff',
        font: '11px monospace',
        padding: '2px 8px',
        borderRadius: 4,
        pointerEvents: 'none',
      }}
    >
      enemies {world.enemies.filter((e) => e.active).length} | ebullets{' '}
      {world.enemyBullets.filter((b) => b.active).length} | pbullets{' '}
      {world.playerBullets.filter((b) => b.active).length} | powerups{' '}
      {world.powerups.filter((p) => p.active).length}
    </div>
  )
}

function isTypingTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA')
  )
}

export function DebugPanel() {
  const { panelOpen, setPanelOpen, timeScale, setTimeScale, overlay, setOverlay, hidden } =
    useDebugStore()
  const [pattern, setPattern] = useState(ALL_PATTERN_IDS[0] ?? '')
  const [jumpWave, setJumpWave] = useState('10')

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== ',' || isTypingTarget(e.target)) return
      setPanelOpen(!useDebugStore.getState().panelOpen)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setPanelOpen])

  useWorldSnapshot(() => {
    const w = getWorld()
    const p = w.player
    return [
      w.waves.suspended,
      w.session.wave,
      w.session.paused,
      p.hp,
      p.lives,
      p.bombs,
      p.wCells,
      p.shield,
      p.godMode,
    ].join(',')
  })

  if (!isDebugMode() || hidden) return null
  if (!panelOpen) return null

  const world = getWorld()
  const p = world.player

  return (
    <div style={panelStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <strong>DEBUG PANEL</strong>
        <Btn label="hide (,)" onClick={() => setPanelOpen(false)} />
      </div>

      <div style={headStyle}>Waves</div>
      <div style={rowStyle}>
        <Btn
          label={world.waves.suspended ? 'Resume waves' : 'Suspend waves'}
          on={world.waves.suspended}
          onClick={() => debugSuspendWaves(world, !world.waves.suspended)}
        />
        <Btn label="Clear all" onClick={() => debugClearAll(world)} />
      </div>
      <div style={rowStyle}>
        <select
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          style={{ width: '100%', background: '#0d1826', color: '#cfeaff' }}
        >
          {ALL_PATTERN_IDS.map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>
        <Btn label="Trigger pattern" onClick={() => debugTriggerPattern(world, pattern)} />
      </div>
      <div style={rowStyle}>
        <span>Wave {world.session.wave}</span>
        <input
          value={jumpWave}
          onChange={(e) => setJumpWave(e.target.value)}
          size={3}
          style={{ background: '#0d1826', color: '#cfeaff', width: 40 }}
        />
        <Btn label="Jump" onClick={() => debugJumpToWave(world, Number(jumpWave) || 1)} />
      </div>

      <div style={headStyle}>Spawn enemy</div>
      <div style={rowStyle}>
        {ENEMY_KINDS.map((kind) => (
          <Btn key={kind} label={kind} onClick={() => debugSpawnEnemy(world, kind)} />
        ))}
      </div>

      <div style={headStyle}>Spawn powerup</div>
      <div style={rowStyle}>
        {POWERUP_TYPES.map((type) => (
          <Btn key={type} label={type} onClick={() => debugSpawnPowerup(world, type)} />
        ))}
      </div>

      <div style={headStyle}>Player</div>
      <div style={rowStyle}>
        <span>
          HP {p.hp}/{p.maxHp}
        </span>
        <Btn label="-" onClick={() => debugAdjustHp(world, -1)} />
        <Btn label="+" onClick={() => debugAdjustHp(world, 1)} />
        <span>Lives {p.lives}</span>
        <Btn label="-" onClick={() => debugAdjustLives(world, -1)} />
        <Btn label="+" onClick={() => debugAdjustLives(world, 1)} />
      </div>
      <div style={rowStyle}>
        <span>
          Bombs {p.bombs}/{p.maxBombs}
        </span>
        <Btn label="-" onClick={() => debugAdjustBombs(world, -1)} />
        <Btn label="+" onClick={() => debugAdjustBombs(world, 1)} />
        <span>Tier {weaponTierForWCells(p.wCells)}</span>
        <Btn label="-" onClick={() => debugAdjustWeaponTier(world, -1)} />
        <Btn label="+" onClick={() => debugAdjustWeaponTier(world, 1)} />
      </div>
      <div style={rowStyle}>
        <Btn label="Shield" on={p.shield} onClick={() => debugSetShield(world, !p.shield)} />
        <Btn
          label="God mode"
          on={debugIsGodMode(world)}
          onClick={() => debugSetGodMode(world, !debugIsGodMode(world))}
        />
        <Btn label="+10k score" onClick={() => debugAddScore(world)} />
        <Btn label="Suicide" onClick={() => debugKillPlayer(world)} />
      </div>

      <div style={headStyle}>Time</div>
      <div style={rowStyle}>
        {TIME_SCALES.map((s) => (
          <Btn key={s} label={`${s}x`} on={timeScale === s} onClick={() => setTimeScale(s)} />
        ))}
      </div>
      <div style={rowStyle}>
        <Btn
          label={world.session.paused ? 'Unpause' : 'Pause'}
          on={world.session.paused}
          onClick={() => debugSetPaused(world, !world.session.paused)}
        />
        <Btn label="Step frame" onClick={() => debugStepOneFrame(world)} />
      </div>

      <div style={headStyle}>Overlay</div>
      <div style={rowStyle}>
        <Btn label="Hitboxes" on={overlay} onClick={() => setOverlay(!overlay)} />
      </div>
    </div>
  )
}

export default function DebugUi({ screen }: { screen: ScreenId }) {
  return (
    <>
      <DebugBadge />
      {screen === 'run' && <DebugPanel />}
      {screen === 'run' && <DebugCounts />}
    </>
  )
}
