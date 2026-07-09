import { useSessionStore } from './sessionStore'
import { Stage } from '../shell/Stage'
import { TitleScreen } from '../shell/screens/TitleScreen'
import { HangarScreen } from '../shell/screens/HangarScreen'
import { UpgradeBayScreen } from '../shell/screens/UpgradeBayScreen'
import { RunScreen } from '../shell/screens/RunScreen'
import { ResultsScreen } from '../shell/screens/ResultsScreen'
import { HighScoresScreen } from '../shell/screens/HighScoresScreen'
import { SettingsScreen } from '../shell/screens/SettingsScreen'

export function App() {
  const screen = useSessionStore((s) => s.screen)

  return (
    <Stage>
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
