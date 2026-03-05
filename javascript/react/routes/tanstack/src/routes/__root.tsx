import { Link, Outlet, createRootRoute } from '@tanstack/react-router'
import '../App.css'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  return (
    <main className="app">
      <section className="card">
        <h1>TanStack Router (file-based)</h1>
        <p className="subtitle">Example with file-based routing, params, and ignored files.</p>

        <nav className="nav">
          <Link to="/" className="nav-link" activeProps={{ className: 'nav-link nav-link-active' }}>
            Home
          </Link>
          <Link to="/about" className="nav-link" activeProps={{ className: 'nav-link nav-link-active' }}>
            About
          </Link>
          <Link to="/posts" className="nav-link" activeProps={{ className: 'nav-link nav-link-active' }}>
            Posts
          </Link>
          <Link to="/users" className="nav-link" activeProps={{ className: 'nav-link nav-link-active' }}>
            Users (pathless)
          </Link>
        </nav>

        <Outlet />
      </section>
    </main>
  )
}
