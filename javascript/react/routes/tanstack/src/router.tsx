import { Link, Outlet, createRoute, createRootRoute, createRouter } from '@tanstack/react-router'
import './App.css'

function RootLayout() {
  return (
    <main className="app">
      <section className="card">
        <h1>TanStack Router POC</h1>
        <p className="subtitle">Minimal routing with two pages</p>

        <nav className="nav">
          <Link to="/" className="nav-link" activeProps={{ className: 'nav-link nav-link-active' }}>
            Home
          </Link>
          <Link to="/about" className="nav-link" activeProps={{ className: 'nav-link nav-link-active' }}>
            About
          </Link>
        </nav>

        <Outlet />
      </section>
    </main>
  )
}

function HomePage() {
  return <p>This is the home page route (/).</p>
}

function AboutPage() {
  return <p>This is the about page route (/about).</p>
}

const rootRoute = createRootRoute({
  component: RootLayout,
})

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
})

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about',
  component: AboutPage,
})

const routeTree = rootRoute.addChildren([homeRoute, aboutRoute])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
