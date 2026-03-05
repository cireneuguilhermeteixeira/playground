import { Link, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/posts/')({
  component: PostsIndexPage,
})

function PostsIndexPage() {
  return (
    <ul>
      <li>
        <Link to="/posts/$postId" params={{ postId: '1' }}>
          Ver post 1
        </Link>
      </li>
      <li>
        <Link to="/posts/$postId" params={{ postId: '2' }}>
          Ver post 2
        </Link>
      </li>
      <li>
        <Link to="/posts/query">Open react-query list example</Link>
      </li>
    </ul>
  )
}
