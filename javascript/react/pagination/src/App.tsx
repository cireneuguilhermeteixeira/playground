import { useEffect, useState } from 'react'
import './App.css'
import { CursorPage } from './pages/CursorPage'
import { ReactWindowPage } from './pages/ReactWindowPage'
import { TanStackPage } from './pages/TanStackPage'

type DemoRoute = 'react-window' | 'offset-server' | 'cursor-server'

function getRouteFromHash(): DemoRoute {
  if (window.location.hash === '#/offset-server') {
    return 'offset-server'
  }

  if (window.location.hash === '#/cursor-server') {
    return 'cursor-server'
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
          href="#/offset-server"
          className={route === 'offset-server' ? 'demo-nav__link is-active' : 'demo-nav__link'}
        >
          Offset Server
        </a>
        <a
          href="#/cursor-server"
          className={route === 'cursor-server' ? 'demo-nav__link is-active' : 'demo-nav__link'}
        >
          Cursor Server
        </a>
      </nav>

      {route === 'react-window' && <ReactWindowPage />}
      {route === 'offset-server' && <TanStackPage />}
      {route === 'cursor-server' && <CursorPage />}
    </main>
  )
}

export default App
