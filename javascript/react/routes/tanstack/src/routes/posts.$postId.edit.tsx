import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/posts/$postId/edit')({
  component: EditPostPage,
})

function EditPostPage() {
  const { postId } = Route.useParams()
  return <p>Subroute of edition for post id <strong>{postId}</strong>.</p>
}
