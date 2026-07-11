import { useSessionStore } from '../../app/sessionStore'
import { playSfx, unlockAudio, syncMusic } from '../../audio/bus'
import { saveSettings, type Quality, type Settings } from '../../persist/settings'
import { resetMeta } from '../../persist/meta'
import { resetHighScores } from '../../persist/highScores'

const QUALITY_OPTIONS: { value: Quality; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string
  hint?: string
  checked: boolean
  onChange: (next: boolean) => void
}) {
  return (
    <label className="setting-row">
      <span className="setting-label">
        {label}
        {hint ? <small>{hint}</small> : null}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={`toggle${checked ? ' is-on' : ''}`}
        onClick={() => onChange(!checked)}
      >
        <span className="toggle-thumb" />
        <span className="toggle-state">{checked ? 'On' : 'Off'}</span>
      </button>
    </label>
  )
}

function Slider({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (next: number) => void
}) {
  return (
    <label className="setting-row">
      <span className="setting-label">{label}</span>
      <span className="slider-wrap">
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        <b className="slider-value">{value}</b>
      </span>
    </label>
  )
}

export function SettingsScreen() {
  const settings = useSessionStore((s) => s.settings)
  const setSettings = useSessionStore((s) => s.setSettings)
  const closeSettings = useSessionStore((s) => s.closeSettings)
  const refreshMeta = useSessionStore((s) => s.refreshMeta)
  const refreshHighScores = useSessionStore((s) => s.refreshHighScores)

  const update = (patch: Partial<Settings>) => {
    const next = { ...settings, ...patch }
    saveSettings(next)
    setSettings(next)
    unlockAudio()
    syncMusic(next)
    playSfx('ui_move', next)
  }

  return (
    <div className="screen settings-screen">
      <header className="screen-header">
        <h2>Settings</h2>
        <p className="screen-kicker">Ship systems configuration</p>
      </header>

      <div className="settings-columns">
        <section className="settings-panel">
          <h3>Video</h3>
          <div className="setting-row">
            <span className="setting-label">
              Quality
              <small>Detail, resolution, and post-processing</small>
            </span>
            <div className="segmented" role="radiogroup" aria-label="Quality">
              {QUALITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={settings.quality === opt.value}
                  className={settings.quality === opt.value ? 'is-active' : ''}
                  onClick={() => update({ quality: opt.value })}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <Toggle
            label="Screen shake"
            hint="Impact camera feedback"
            checked={settings.screenShake}
            onChange={(v) => update({ screenShake: v })}
          />
          <Toggle
            label="Reduced motion"
            hint="Calms sway, shake, and banner motion"
            checked={settings.reducedMotion}
            onChange={(v) => update({ reducedMotion: v })}
          />
        </section>

        <section className="settings-panel">
          <h3>Audio</h3>
          <Slider label="Master" value={settings.master} onChange={(v) => update({ master: v })} />
          <Slider label="Music" value={settings.music} onChange={(v) => update({ music: v })} />
          <Slider label="SFX" value={settings.sfx} onChange={(v) => update({ sfx: v })} />
        </section>

        <section className="settings-panel">
          <h3>Controls</h3>
          <Toggle
            label="Autofire"
            hint="Hold is implied; lance fires itself"
            checked={settings.autoFire}
            onChange={(v) => update({ autoFire: v })}
          />
          <p className="muted setting-note">
            WASD / Arrows move · Space / J fire · Shift / K bomb · Esc / P pause · Touch: drag left
            to steer, tap ✦ to bomb
          </p>
        </section>

        <section className="settings-panel is-danger">
          <h3>Data</h3>
          <div className="setting-row">
            <span className="setting-label">
              Meta progress
              <small>Scrap and all upgrade ranks</small>
            </span>
            <button
              type="button"
              className="danger-btn"
              onClick={() => {
                if (confirm('Reset all meta upgrades and Scrap?')) {
                  resetMeta()
                  refreshMeta()
                }
              }}
            >
              Reset
            </button>
          </div>
          <div className="setting-row">
            <span className="setting-label">
              High scores
              <small>Local leaderboard entries</small>
            </span>
            <button
              type="button"
              className="danger-btn"
              onClick={() => {
                if (confirm('Reset high scores?')) {
                  resetHighScores()
                  refreshHighScores()
                }
              }}
            >
              Reset
            </button>
          </div>
        </section>
      </div>

      <div className="row screen-actions">
        <button type="button" className="primary-action" onClick={closeSettings}>
          Back
        </button>
      </div>
    </div>
  )
}
