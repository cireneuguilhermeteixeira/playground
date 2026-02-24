import { lazy, Suspense } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Navigate,
  Outlet,
  useNavigate,
  useParams,
  useLocation,
  useNavigationType,
  useSearchParams,
} from 'react-router-dom';
import type { ReactNode } from 'react';

const LazyAbout = lazy(() => import('./routes/About'));
const LazyDashboardSettings = lazy(() => import('./routes/DashboardSettings'));

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

function AboutWrapper() {
  return (
    <Suspense fallback={<p>Loading About...</p>}>
      <LazyAbout />
    </Suspense>
  );
}

function User() {
  const { userId } = useParams();
  return (
    <section>
      <h2>User</h2>
      <p>Loaded user id: {userId}</p>
      <p>Note: classic router uses hooks for data; no loaders.</p>
    </section>
  );
}

function Search() {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';

  return (
    <section>
      <h2>Search</h2>
      <p>Query param: {query || '(empty)'}</p>
      <div className="row">
        <button type="button" onClick={() => setParams({ q: 'router' })}>
          Set q=router
        </button>
        <button type="button" onClick={() => setParams({})}>
          Clear
        </button>
      </div>
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

function DashboardSettingsWrapper() {
  return (
    <Suspense fallback={<p>Loading Settings...</p>}>
      <LazyDashboardSettings />
    </Suspense>
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

const isAuthenticated = false;

export function AppClassic() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<AboutWrapper />} />
          <Route path="users/:userId" element={<User />} />
          <Route path="search" element={<Search />} />
          <Route path="login" element={<Login />} />
          <Route
            path="dashboard"
            element={
              <RequireAuth isAuthenticated={isAuthenticated}>
                <DashboardLayout />
              </RequireAuth>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="settings" element={<DashboardSettingsWrapper />} />
          </Route>
          <Route path="go" element={<Navigate to="/about" replace />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
