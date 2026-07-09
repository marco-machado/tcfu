import { useSessionStore } from '../../app/sessionStore'
import { saveSettings, type Quality } from '../../persist/settings'
import { resetMeta } from '../../persist/meta'
import { resetHighScores } from '../../persist/highScores'

export function SettingsScreen() {
  const settings = useSessionStore((s) => s.settings)
  const setSettings = useSessionStore((s) => s.setSettings)
  const setScreen = useSessionStore((s) => s.setScreen)
  const refreshMeta = useSessionStore((s) => s.refreshMeta)
  const refreshHighScores = useSessionStore((s) => s.refreshHighScores)

  const update = (patch: Partial<typeof settings>) => {
    const next = { ...settings, ...patch }
    saveSettings(next)
    setSettings(next)
  }

  return (
    <div className="screen">
      <h2>Settings</h2>
      <label className="row">
        Quality
        <select
          value={settings.quality}
          onChange={(e) => update({ quality: e.target.value as Quality })}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </label>
      <label className="row">
        Master
        <input
          type="range"
          min={0}
          max={100}
          value={settings.master}
          onChange={(e) => update({ master: Number(e.target.value) })}
        />
      </label>
      <label className="row">
        Music
        <input
          type="range"
          min={0}
          max={100}
          value={settings.music}
          onChange={(e) => update({ music: Number(e.target.value) })}
        />
      </label>
      <label className="row">
        SFX
        <input
          type="range"
          min={0}
          max={100}
          value={settings.sfx}
          onChange={(e) => update({ sfx: Number(e.target.value) })}
        />
      </label>
      <p className="muted">
        Input (read-only): WASD/Arrows move · Space/J fire · Shift/K bomb · Esc/P pause
      </p>
      <div className="row">
        <button
          type="button"
          onClick={() => {
            if (confirm('Reset all meta upgrades and scrap?')) {
              resetMeta()
              refreshMeta()
            }
          }}
        >
          Reset meta
        </button>
        <button
          type="button"
          onClick={() => {
            if (confirm('Reset high scores?')) {
              resetHighScores()
              refreshHighScores()
            }
          }}
        >
          Reset high scores
        </button>
      </div>
      <button type="button" onClick={() => setScreen('title')}>
        Back
      </button>
    </div>
  )
}
