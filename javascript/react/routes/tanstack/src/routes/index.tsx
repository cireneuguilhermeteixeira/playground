import { Link, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div>
      <p>Manage by file: Active file-based routing.</p>
      <ul>
        <li>
          <Link to="/posts">/posts</Link>
        </li>
        <li>
          <Link to="/posts/$postId" params={{ postId: '42' }}>
            /posts/$postId (dynamic id)
          </Link>
        </li>
        <li>
          <Link to="/posts/$postId/edit" params={{ postId: '42' }}>
            /posts/$postId/edit (subroute of id)
          </Link>
        </li>
        <li>
          <Link to="/posts/query">/posts/query (react-query example)</Link>
        </li>
        <li>
          <Link to="/orgs/$orgId/users/$userId" params={{ orgId: 'acme', userId: 'u-7' }}>
            /orgs/$orgId/users/$userId (2 ids)
          </Link>
        </li>
        <li>
          <Link to="/users">/users (inside _admin pathless)</Link>
        </li>
        <li>
          <Link to="/settings/profile">/settings/profile (inside _admin pathless)</Link>
        </li>
        <li>
          <Link to="/index">/index (escaped file [index].tsx)</Link>
        </li>
      </ul>
    </div>
  )
}
