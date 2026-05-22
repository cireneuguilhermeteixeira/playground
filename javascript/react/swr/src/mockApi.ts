import type { Ticket, TicketStatus } from './types'

type CreateTicketInput = {
  title: string
  owner: string
}

type UpdateTicketStatusInput = {
  id: string
  status: TicketStatus
}

let tickets: Ticket[] = [
  {
    id: 'FE-101',
    title: 'Refinar loading state do dashboard',
    owner: 'Ana',
    status: 'In Progress',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'API-204',
    title: 'Normalizar payload de relatórios',
    owner: 'Bruno',
    status: 'Backlog',
    updatedAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
  },
  {
    id: 'OPS-077',
    title: 'Adicionar healthcheck do worker',
    owner: 'Carla',
    status: 'Done',
    updatedAt: new Date(Date.now() - 1000 * 60 * 44).toISOString(),
  },
]

function delay(ms = 600) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

function sortByUpdatedAt(items: Ticket[]) {
  return [...items].sort((left, right) => {
    return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
  })
}

export async function listTickets() {
  await delay()
  return sortByUpdatedAt(tickets)
}

export async function createTicket(input: CreateTicketInput) {
  await delay(450)

  const ticket: Ticket = {
    id: `WEB-${Math.floor(Math.random() * 900 + 100)}`,
    title: input.title,
    owner: input.owner,
    status: 'Backlog',
    updatedAt: new Date().toISOString(),
  }

  tickets = sortByUpdatedAt([ticket, ...tickets])
  return ticket
}

export async function updateTicketStatus(input: UpdateTicketStatusInput) {
  await delay(350)

  tickets = tickets.map((ticket) =>
    ticket.id === input.id
      ? {
          ...ticket,
          status: input.status,
          updatedAt: new Date().toISOString(),
        }
      : ticket,
  )

  const updated = tickets.find((ticket) => ticket.id === input.id)

  if (!updated) {
    throw new Error(`Ticket ${input.id} was not found.`)
  }

  tickets = sortByUpdatedAt(tickets)
  return updated
}
