import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { ProgressProvider } from './context/ProgressContext.tsx'
import { primeVoices } from './lib/speech.ts'
import './index.css'

primeVoices()

const root = document.getElementById('root')
if (!root) throw new Error('root 要素が見つかりません。')

createRoot(root).render(
  <StrictMode>
    <ProgressProvider>
      <App />
    </ProgressProvider>
  </StrictMode>,
)
