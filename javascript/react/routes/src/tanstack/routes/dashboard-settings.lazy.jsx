import { createLazyRoute } from '@tanstack/react-router';

function DashboardSettings() {
  return (
    <div>
      <p>Nested settings route (lazy-loaded).</p>
    </div>
  );
}

export const Route = createLazyRoute('/dashboard/settings')({
  component: DashboardSettings,
});
