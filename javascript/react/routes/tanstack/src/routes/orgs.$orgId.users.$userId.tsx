import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/orgs/$orgId/users/$userId')({
  component: OrgUserPage,
})

function OrgUserPage() {
  const { orgId, userId } = Route.useParams()
  return (
    <p>
      Route with multiple IDs: org <strong>{orgId}</strong>, user <strong>{userId}</strong>.
    </p>
  )
}
