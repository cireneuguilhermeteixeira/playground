import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/index')({
  component: LiteralIndexPage,
})

function LiteralIndexPage() {
  return <p>File <code>[index].tsx</code> create literal route<code>/index</code>.</p>
}
