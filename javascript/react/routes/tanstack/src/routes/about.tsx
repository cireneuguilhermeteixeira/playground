import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: AboutPage,
})

function AboutPage() {
  return <p>Static simple route in unique file: <code>about.tsx</code>.</p>
}
