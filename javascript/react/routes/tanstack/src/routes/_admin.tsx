import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin')({
  component: AdminPathlessLayout,
})

function AdminPathlessLayout() {
  return (
    <section>
      <h2>Layout Pathless (_admin)</h2>
      <p>Arquivo começa com underscore e organiza páginas sem adicionar segmento na URL.</p>
      <Outlet />
    </section>
  )
}
