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
} from 'react-router-dom';

function Layout() {
  return (
    <div className="container">
      <header className="header">
        <h1>Routes POC</h1>
        <nav className="nav">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/users/42">User 42</NavLink>
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

function About() {
  const location = useLocation();
  return (
    <section>
      <h2>About</h2>
      <p>Current path: {location.pathname}</p>
    </section>
  );
}

function User() {
  const { userId } = useParams();
  return (
    <section>
      <h2>User</h2>
      <p>Loaded user id: {userId}</p>
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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="users/:userId" element={<User />} />
          <Route path="go" element={<Navigate to="/about" replace />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
