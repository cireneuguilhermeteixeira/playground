import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { SWRConfig } from 'swr'
import App from './App'
import './style.css'

const container = document.getElementById('app')

if (!container) {
  throw new Error('Root element #app was not found.')
}

createRoot(container).render(
  <StrictMode>
    <SWRConfig
      value={{
        revalidateOnFocus: true,
        shouldRetryOnError: false,
      }}
    >
      <App />
    </SWRConfig>
  </StrictMode>,
)
