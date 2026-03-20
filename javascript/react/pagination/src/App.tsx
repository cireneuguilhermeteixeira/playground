import { useEffect, useState } from 'react'
import './App.css'
import { ReactWindowPage } from './pages/ReactWindowPage'
import { TanStackPage } from './pages/TanStackPage'

type DemoRoute = 'react-window' | 'tanstack'

function getRouteFromHash(): DemoRoute {
  return window.location.hash === '#/tanstack' ? 'tanstack' : 'react-window'
}

function App() {
  const [route, setRoute] = useState<DemoRoute>(getRouteFromHash)

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(getRouteFromHash())
    }

    window.addEventListener('hashchange', handleHashChange)

    return () => {
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [])

  return (
    <main className="app">
      <nav className="demo-nav" aria-label="Demo pages">
        <a
          href="#/"
          className={route === 'react-window' ? 'demo-nav__link is-active' : 'demo-nav__link'}
        >
          React Window
        </a>
        <a
          href="#/tanstack"
          className={route === 'tanstack' ? 'demo-nav__link is-active' : 'demo-nav__link'}
        >
          TanStack Query + Table
        </a>
      </nav>

      {route === 'react-window' ? <ReactWindowPage /> : <TanStackPage />}
    </main>
  )
}

export default App
