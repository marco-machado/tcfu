import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Must evaluate before App so the sandboxed save engages ahead of the
// session store's persistence reads.
import './app/debugMode'
import { App } from './app/App'
import { installAcceptanceSeam } from './app/acceptanceSeam'
import { installTestHooks } from './app/testHooks'
import './app/styles/index.css'

installAcceptanceSeam()
installTestHooks()

const root = document.getElementById('root')
if (!root) throw new Error('Root element #root not found')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
