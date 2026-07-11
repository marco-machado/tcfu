import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'
import { installAcceptanceSeam } from './app/acceptanceSeam'
import { installTestHooks } from './app/testHooks'
import './app/styles.css'

installAcceptanceSeam()
installTestHooks()

const root = document.getElementById('root')
if (!root) throw new Error('Root element #root not found')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
