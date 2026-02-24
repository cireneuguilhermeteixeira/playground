import { useLocation } from 'react-router-dom';

export default function About() {
  const location = useLocation();
  const state = location.state as { from?: string } | null;
  return (
    <section>
      <h2>About</h2>
      <p>Current path: {location.pathname}</p>
      <p>State from navigation: {state?.from ?? 'none'}</p>
      <p>This route is lazy-loaded for code splitting.</p>
    </section>
  );
}
