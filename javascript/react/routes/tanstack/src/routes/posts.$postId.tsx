import { createFileRoute } from '@tanstack/react-router'
import { PostSummary } from './posts/-components/PostSummary'
import { formatTag } from './posts/-helpers/formatTag'

export const Route = createFileRoute('/posts/$postId')({
  component: PostDetailsPage,
})

function PostDetailsPage() {
  const { postId } = Route.useParams()

  return (
    <div>
      <p>Detalhes do post com id dinâmico: <strong>{postId}</strong>.</p>
      <PostSummary title={`Post ${postId}`} tag={formatTag('filebased')} />
    </div>
  )
}
