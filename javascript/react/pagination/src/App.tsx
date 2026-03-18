import { useEffect, useState } from 'react'
import './App.css'
import { BackendPaginationPage } from './pages/BackendPaginationPage'
import { ReactWindowPage } from './pages/ReactWindowPage'
import { TanStackPage } from './pages/TanStackPage'

type DemoRoute = 'react-window' | 'tanstack' | 'backend'

function getRouteFromHash(): DemoRoute {
  if (window.location.hash === '#/tanstack') {
    return 'tanstack'
  }

  if (window.location.hash === '#/backend') {
    return 'backend'
  }

  return 'react-window'
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
        <a
          href="#/backend"
          className={route === 'backend' ? 'demo-nav__link is-active' : 'demo-nav__link'}
        >
          Real Backend
        </a>
      </nav>

      {route === 'react-window' ? (
        <ReactWindowPage />
      ) : route === 'tanstack' ? (
        <TanStackPage />
      ) : (
        <BackendPaginationPage />
      )}
    </main>
  )
}

export default App
