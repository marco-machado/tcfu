import { useSessionStore } from '../sessionStore'
import { playSfx, unlockAudio } from '../../audio/bus'
import { saveSettings, type Quality, type Settings } from '../../persist/settings'
import { resetMeta } from '../../persist/meta'
import { resetHighScores } from '../../persist/highScores'
import { Button, Panel, ScreenHeader, Segmented, Slider, Toggle } from '../components/ui'

const QUALITY_OPTIONS: { value: Quality; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

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
    playSfx('ui_move', next)
  }

  return (
    <div className="screen settings-screen">
      <ScreenHeader title="Settings" kicker="Ship systems configuration" />

      <div className="settings-columns">
        <Panel as="section" className="settings-panel">
          <h3>Video</h3>
          <div className="setting-row">
            <span className="setting-label">
              Quality
              <small>Detail, resolution, and post-processing</small>
            </span>
            <Segmented
              label="Quality"
              options={QUALITY_OPTIONS}
              value={settings.quality}
              onChange={(v) => update({ quality: v })}
            />
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
        </Panel>

        <Panel as="section" className="settings-panel">
          <h3>Audio</h3>
          <Slider label="Master" value={settings.master} onChange={(v) => update({ master: v })} />
          <Slider label="Music" value={settings.music} onChange={(v) => update({ music: v })} />
          <Slider label="SFX" value={settings.sfx} onChange={(v) => update({ sfx: v })} />
        </Panel>

        <Panel as="section" className="settings-panel">
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
        </Panel>

        <Panel as="section" tone="danger" className="settings-panel">
          <h3>Data</h3>
          <div className="setting-row">
            <span className="setting-label">
              Meta progress
              <small>Scrap and all upgrade ranks</small>
            </span>
            <Button
              variant="danger"
              onClick={() => {
                if (confirm('Reset all meta upgrades and Scrap?')) {
                  resetMeta()
                  refreshMeta()
                }
              }}
            >
              Reset
            </Button>
          </div>
          <div className="setting-row">
            <span className="setting-label">
              High scores
              <small>Local leaderboard entries</small>
            </span>
            <Button
              variant="danger"
              onClick={() => {
                if (confirm('Reset high scores?')) {
                  resetHighScores()
                  refreshHighScores()
                }
              }}
            >
              Reset
            </Button>
          </div>
        </Panel>
      </div>

      <div className="row screen-actions">
        <Button variant="primary" onClick={closeSettings}>
          Back
        </Button>
      </div>
    </div>
  )
}
