import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  Link,
  useNavigate,
} from '@tanstack/react-router';
import { searchLoader, userLoader } from './tanstack/loaders.js';

function Layout() {
  return (
    <div className="container">
      <header className="header">
        <h1>Routes POC</h1>
        <nav className="nav">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/users/42">User 42</Link>
          <Link to="/search" search={{ q: 'react' }}>
            Search
          </Link>
          <Link to="/dashboard">Dashboard</Link>
        </nav>
      </header>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}

function Home() {
  const navigate = useNavigate();
  return (
    <section>
      <h2>Home</h2>
      <p>TanStack Router example with loaders and lazy routes.</p>
      <button type="button" onClick={() => navigate({ to: '/about' })}>
        Go to About (programmatic)
      </button>
    </section>
  );
}

function User() {
  const data = userRoute.useLoaderData();
  return (
    <section>
      <h2>User</h2>
      <p>Loaded user id: {data.userId}</p>
      <p>Loaded at: {data.loadedAt}</p>
    </section>
  );
}

function Search() {
  const search = searchRoute.useSearch();
  const data = searchRoute.useLoaderData();
  const navigate = useNavigate({ from: '/search' });

  return (
    <section>
      <h2>Search</h2>
      <p>Query param (loader): {data.query || '(empty)'}</p>
      <div className="row">
        <button
          type="button"
          onClick={() => navigate({ search: { q: 'router' } })}
        >
          Set q=router
        </button>
        <button type="button" onClick={() => navigate({ search: {} })}>
          Clear
        </button>
      </div>
      <p>Query param (state): {search.q || '(empty)'}</p>
    </section>
  );
}

function DashboardLayout() {
  return (
    <section>
      <h2>Dashboard</h2>
      <nav className="subnav">
        <Link to="/dashboard">Overview</Link>
        <Link to="/dashboard/settings">Settings</Link>
      </nav>
      <Outlet />
    </section>
  );
}

function DashboardHome() {
  return (
    <div>
      <p>Nested index route content.</p>
    </div>
  );
}

function NotFound() {
  return (
    <section>
      <h2>404</h2>
      <p>Nothing here.</p>
    </section>
  );
}

const rootRoute = createRootRoute({
  component: Layout,
  notFoundComponent: NotFound,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
});

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'about',
}).lazy(() => import('./tanstack/routes/about.lazy.jsx'));

const userRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'users/$userId',
  loader: userLoader,
  component: User,
});

const searchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'search',
  validateSearch: (search) => ({
    q: typeof search.q === 'string' ? search.q : '',
  }),
  loader: searchLoader,
  component: Search,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'dashboard',
  component: DashboardLayout,
});

const dashboardIndexRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: '/',
  component: DashboardHome,
});

const dashboardSettingsRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: 'settings',
}).lazy(() => import('./tanstack/routes/dashboard-settings.lazy.jsx'));

const routeTree = rootRoute.addChildren([
  indexRoute,
  aboutRoute,
  userRoute,
  searchRoute,
  dashboardRoute.addChildren([dashboardIndexRoute, dashboardSettingsRoute]),
]);

export const router = createRouter({ routeTree });
