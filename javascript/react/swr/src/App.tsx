import { FormEvent, useMemo, useState } from 'react'
import useSWR, { mutate } from 'swr'
import useSWRMutation from 'swr/mutation'
import { createTicket, listTickets, updateTicketStatus } from './mockApi'
import type { Ticket, TicketStatus } from './types'

const STATUSES: TicketStatus[] = ['Backlog', 'In Progress', 'Done']
const TICKETS_KEY = 'tickets'

function formatDate(isoDate: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(isoDate))
}

function App() {
  const [title, setTitle] = useState('')
  const [owner, setOwner] = useState('')
  const [activeStatus, setActiveStatus] = useState<TicketStatus | 'All'>('All')

  const {
    data: tickets,
    error,
    isLoading,
    isValidating,
  } = useSWR(TICKETS_KEY, listTickets, {
    refreshInterval: 8_000,
  })

  const { trigger: createNewTicket, isMutating: isCreating } = useSWRMutation(
    TICKETS_KEY,
    async (_, { arg }: { arg: { title: string; owner: string } }) => {
      const created = await createTicket(arg)
      await mutate(TICKETS_KEY)
      return created
    },
  )

  const visibleTickets = useMemo(() => {
    if (!tickets) {
      return []
    }

    if (activeStatus === 'All') {
      return tickets
    }

    return tickets.filter((ticket) => ticket.status === activeStatus)
  }, [activeStatus, tickets])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedTitle = title.trim()
    const trimmedOwner = owner.trim()

    if (!trimmedTitle || !trimmedOwner) {
      return
    }

    await createNewTicket({ title: trimmedTitle, owner: trimmedOwner })
    setTitle('')
    setOwner('')
  }

  async function handleStatusChange(ticket: Ticket, status: TicketStatus) {
    const optimisticTicket: Ticket = {
      ...ticket,
      status,
      updatedAt: new Date().toISOString(),
    }

    await mutate<Ticket[]>(
      TICKETS_KEY,
      async (currentTickets) => {
        await updateTicketStatus({ id: ticket.id, status })
        return currentTickets?.map((item) => (item.id === ticket.id ? optimisticTicket : item)) ?? []
      },
      {
        optimisticData: (currentTickets) =>
          currentTickets?.map((item) => (item.id === ticket.id ? optimisticTicket : item)) ?? [],
        rollbackOnError: true,
        revalidate: true,
        populateCache: false,
      },
    )
  }

  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">React + SWR</p>
        <h1>POC de fetch moderno com cache, revalidação e mutation otimista</h1>
        <p className="hero__copy">
          Esta demo usa um mock assíncrono local para simular uma API e mostrar o fluxo
          recomendado com a lib da Vercel.
        </p>
        <div className="hero__meta">
          <span>{isLoading ? 'Carregando tickets...' : `${tickets?.length ?? 0} tickets em cache`}</span>
          <span>{isValidating ? 'Revalidando em background' : 'Cache sincronizado'}</span>
        </div>
      </section>

      <section className="panel">
        <div className="panel__header">
          <div>
            <h2>Novo ticket</h2>
            <p>Cria dados e deixa o SWR cuidar da atualização do cache.</p>
          </div>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <label>
            Título
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ex.: Ajustar skeleton da home"
            />
          </label>

          <label>
            Responsável
            <input
              value={owner}
              onChange={(event) => setOwner(event.target.value)}
              placeholder="Ex.: Diego"
            />
          </label>

          <button type="submit" disabled={isCreating}>
            {isCreating ? 'Salvando...' : 'Criar ticket'}
          </button>
        </form>
      </section>

      <section className="panel">
        <div className="panel__header">
          <div>
            <h2>Board</h2>
            <p>`useSWR` busca, reaproveita cache e revalida sozinho.</p>
          </div>

          <label className="filter">
            Status
            <select
              value={activeStatus}
              onChange={(event) => setActiveStatus(event.target.value as TicketStatus | 'All')}
            >
              <option value="All">Todos</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error ? <p className="state error">{error.message}</p> : null}
        {isLoading ? <p className="state">Carregando dados...</p> : null}

        <div className="ticket-list">
          {visibleTickets.map((ticket) => (
            <article key={ticket.id} className="ticket-card">
              <div className="ticket-card__top">
                <div>
                  <p className="ticket-card__id">{ticket.id}</p>
                  <h3>{ticket.title}</h3>
                </div>
                <span className={`badge badge--${ticket.status.toLowerCase().replace(/\s+/g, '-')}`}>
                  {ticket.status}
                </span>
              </div>

              <dl className="ticket-card__meta">
                <div>
                  <dt>Owner</dt>
                  <dd>{ticket.owner}</dd>
                </div>
                <div>
                  <dt>Updated</dt>
                  <dd>{formatDate(ticket.updatedAt)}</dd>
                </div>
              </dl>

              <div className="ticket-card__actions">
                {STATUSES.map((status) => (
                  <button
                    key={status}
                    type="button"
                    className={status === ticket.status ? 'ghost-button is-active' : 'ghost-button'}
                    onClick={() => void handleStatusChange(ticket, status)}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

export default App
