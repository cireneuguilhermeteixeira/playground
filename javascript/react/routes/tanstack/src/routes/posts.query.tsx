import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { fetchPostsQueryExample } from './posts/-helpers/fetchPostsQueryExample'

export const Route = createFileRoute('/posts/query')({
  component: PostsQueryExamplePage,
})

function PostsQueryExamplePage() {
  const postsQuery = useQuery({
    queryKey: ['posts', 'query-example'],
    queryFn: fetchPostsQueryExample,
  })

  return (
    <section>
      <h3>React Query Example</h3>
      <p>Data is loaded with useQuery and cached by query key.</p>

      {postsQuery.isPending && <p>Loading posts...</p>}

      {postsQuery.isError && (
        <p>
          Error loading posts: <strong>{postsQuery.error.message}</strong>
        </p>
      )}

      {postsQuery.isSuccess && (
        <ul>
          {postsQuery.data.map((post) => (
            <li key={post.id}>
              {post.id} - {post.title}
            </li>
          ))}
        </ul>
      )}

      <button type="button" onClick={() => postsQuery.refetch()}>
        Refetch posts
      </button>
    </section>
  )
}
