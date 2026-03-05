import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin')({
  component: AdminPathlessLayout,
})

function AdminPathlessLayout() {
  return (
    <section>
      <h2>Layout Pathless (_admin)</h2>
      <p>
        File with underscore prefix organizes pages without adding segment to the URL.
        </p>
      <Outlet />
    </section>
  )
}
