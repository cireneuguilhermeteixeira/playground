import { createLazyRoute } from '@tanstack/react-router';

function About() {
  return (
    <section>
      <h2>About</h2>
      <p>This route is lazy-loaded for code splitting.</p>
    </section>
  );
}

export const Route = createLazyRoute('/about')({
  component: About,
});
