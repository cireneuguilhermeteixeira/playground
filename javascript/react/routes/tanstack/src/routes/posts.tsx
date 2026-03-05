import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/posts')({
  component: PostsLayout,
})

function PostsLayout() {
  return (
    <section>
      <h2>Posts</h2>
      <p>Main layout for the posts tree.</p>
      <Outlet />
    </section>
  )
}
