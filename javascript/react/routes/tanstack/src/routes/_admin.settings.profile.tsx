import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin/settings/profile')({
  component: AdminProfilePage,
})

function AdminProfilePage() {
  return <p>URL final: <code>/settings/profile</code> sob o mesmo layout pathless.</p>
}
