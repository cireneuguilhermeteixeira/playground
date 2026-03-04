import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/posts')({
  component: PostsLayout,
})

function PostsLayout() {
  return (
    <section>
      <h2>Posts</h2>
      <p>Layout pai da árvore de posts.</p>
      <Outlet />
    </section>
  )
}
