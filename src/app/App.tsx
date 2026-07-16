import { useSessionStore } from './sessionStore'
import { Stage } from './components/Stage'
import { TitleScreen } from './screens/TitleScreen'
import { HangarScreen } from './screens/HangarScreen'
import { UpgradeBayScreen } from './screens/UpgradeBayScreen'
import { RunScreen } from './screens/RunScreen'
import { ResultsScreen } from './screens/ResultsScreen'
import { HighScoresScreen } from './screens/HighScoresScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { isDebugMode } from './debugMode'
import { isAudioUnlocked, setMusicGamePaused, syncMusic, unlockAudio } from '../audio/bus'
import { Suspense, lazy, useEffect } from 'react'

// Dynamic import under a DEV constant so production builds drop the debug UI chunk.
const DebugUi = import.meta.env.DEV ? lazy(() => import('./components/DebugPanel')) : null

export function App() {
  const screen = useSessionStore((s) => s.screen)
  const settings = useSessionStore((s) => s.settings)

  useEffect(() => {
    if (screen !== 'run') setMusicGamePaused(false)
    syncMusic(settings, screen === 'run' ? 'combat' : 'menu')
  }, [screen, settings])

  // Autoplay is gated behind a user gesture, so start the track on the first
  // interaction anywhere rather than waiting for a specific menu button.
  useEffect(() => {
    if (isAudioUnlocked()) return
    const start = () => {
      window.removeEventListener('pointerdown', start)
      window.removeEventListener('keydown', start)
      window.removeEventListener('touchstart', start)
      const s = useSessionStore.getState()
      unlockAudio()
      syncMusic(s.settings, s.screen === 'run' ? 'combat' : 'menu')
    }
    window.addEventListener('pointerdown', start)
    window.addEventListener('keydown', start)
    window.addEventListener('touchstart', start)
    return () => {
      window.removeEventListener('pointerdown', start)
      window.removeEventListener('keydown', start)
      window.removeEventListener('touchstart', start)
    }
  }, [])

  return (
    <Stage>
      {DebugUi && isDebugMode() && (
        <Suspense fallback={null}>
          <DebugUi screen={screen} />
        </Suspense>
      )}
      {screen === 'title' && <TitleScreen />}
      {screen === 'hangar' && <HangarScreen />}
      {screen === 'upgradeBay' && <UpgradeBayScreen />}
      {screen === 'run' && <RunScreen />}
      {screen === 'results' && <ResultsScreen />}
      {screen === 'highScores' && <HighScoresScreen />}
      {screen === 'settings' && <SettingsScreen />}
    </Stage>
  )
}
