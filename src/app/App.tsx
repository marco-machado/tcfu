import { useSessionStore } from './sessionStore'
import { Stage } from '../shell/Stage'
import { TitleScreen } from '../shell/screens/TitleScreen'
import { HangarScreen } from '../shell/screens/HangarScreen'
import { UpgradeBayScreen } from '../shell/screens/UpgradeBayScreen'
import { RunScreen } from '../shell/screens/RunScreen'
import { ResultsScreen } from '../shell/screens/ResultsScreen'
import { HighScoresScreen } from '../shell/screens/HighScoresScreen'
import { SettingsScreen } from '../shell/screens/SettingsScreen'
import { isDebugMode } from './debugMode'
import { setMusicGamePaused, syncMusic } from '../audio/bus'
import { Suspense, lazy, useEffect } from 'react'

// Dynamic import under a DEV constant so production builds drop the debug UI chunk.
const DebugUi = import.meta.env.DEV ? lazy(() => import('../shell/DebugPanel')) : null

export function App() {
  const screen = useSessionStore((s) => s.screen)
  const settings = useSessionStore((s) => s.settings)

  useEffect(() => {
    if (screen !== 'run') setMusicGamePaused(false)
    syncMusic(settings, screen === 'run' ? 'combat' : 'menu')
  }, [screen, settings])

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
