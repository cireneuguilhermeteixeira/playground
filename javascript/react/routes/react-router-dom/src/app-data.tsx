import {
  createBrowserRouter,
  NavLink,
  Navigate,
  Outlet,
  useNavigate,
  useLocation,
  useNavigationType,
  useSearchParams,
  useLoaderData,
  useRouteError,
  isRouteErrorResponse,
} from 'react-router-dom';
import type { ReactNode } from 'react';
import { searchLoader, userLoader } from './loaders/dataLoaders';

function Layout() {
  const navType = useNavigationType();
  const location = useLocation();

  return (
    <div className="container">
      <header className="header">
        <h1>Routes POC</h1>
        <div className="meta">
          <span>Navigation type: {navType}</span>
          <span>Path: {location.pathname}</span>
        </div>
        <nav className="nav">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/users/42">User 42</NavLink>
          <NavLink to="/search?q=react">Search</NavLink>
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/login">Login</NavLink>
          <NavLink to="/go">Redirect</NavLink>
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
      <p>This page shows navigation and nested routes.</p>
      <button type="button" onClick={() => navigate('/about')}>
        Go to About (programmatic)
      </button>
    </section>
  );
}

function User() {
  const data = useLoaderData() as { userId: string; loadedAt: string };
  return (
    <section>
      <h2>User</h2>
      <p>Loaded user id: {data.userId}</p>
      <p>Loaded at: {data.loadedAt}</p>
    </section>
  );
}

function Search() {
  const data = useLoaderData() as { query: string };
  const [params, setParams] = useSearchParams();

  return (
    <section>
      <h2>Search</h2>
      <p>Query param (loader): {data.query || '(empty)'}</p>
      <div className="row">
        <button type="button" onClick={() => setParams({ q: 'router' })}>
          Set q=router
        </button>
        <button type="button" onClick={() => setParams({})}>
          Clear
        </button>
      </div>
      <p>Query param (state): {params.get('q') ?? '(empty)'}</p>
    </section>
  );
}

type RequireAuthProps = {
  isAuthenticated: boolean;
  children: ReactNode;
};

function RequireAuth({ isAuthenticated, children }: RequireAuthProps) {
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}

function DashboardLayout() {
  return (
    <section>
      <h2>Dashboard</h2>
      <nav className="subnav">
        <NavLink to="/dashboard" end>
          Overview
        </NavLink>
        <NavLink to="/dashboard/settings">Settings</NavLink>
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

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { from?: string } | null;
  const from = state?.from ?? '/dashboard';

  return (
    <section>
      <h2>Login</h2>
      <p>This page demonstrates a redirect with REPLACE.</p>
      <button type="button" onClick={() => navigate(from, { replace: true })}>
        Sign in
      </button>
    </section>
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

function RouteError() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : 'Unknown error';

  return (
    <section>
      <h2>Route Error</h2>
      <p>{message}</p>
    </section>
  );
}

const isAuthenticated = false;

export const router = createBrowserRouter([
  {
    element: <Layout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <Home /> },
      {
        path: 'about',
        lazy: () => import('./routes/About'),
      },
      {
        path: 'users/:userId',
        element: <User />,
        loader: userLoader,
        errorElement: <RouteError />,
      },
      {
        path: 'search',
        element: <Search />,
        loader: searchLoader,
        errorElement: <RouteError />,
      },
      { path: 'login', element: <Login /> },
      {
        path: 'dashboard',
        element: (
          <RequireAuth isAuthenticated={isAuthenticated}>
            <DashboardLayout />
          </RequireAuth>
        ),
        children: [
          { index: true, element: <DashboardHome /> },
          {
            path: 'settings',
            lazy: () => import('./routes/DashboardSettings'),
          },
        ],
      },
      { path: 'go', element: <Navigate to="/about" replace /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
