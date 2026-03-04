import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin/users')({
  component: UsersFromAdminLayoutPage,
})

function UsersFromAdminLayoutPage() {
  return <p>URL final: <code>/users</code>, mas usando o layout pathless <code>_admin.tsx</code>.</p>
}
