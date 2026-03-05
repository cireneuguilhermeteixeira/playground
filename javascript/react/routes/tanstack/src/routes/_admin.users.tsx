import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin/users')({
  component: UsersFromAdminLayoutPage,
})

function UsersFromAdminLayoutPage() {
  return <p>final URL: <code>/users</code>, but using the pathless layout <code>_admin.tsx</code>.</p>
}
