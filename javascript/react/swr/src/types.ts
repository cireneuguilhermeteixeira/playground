export type TicketStatus = 'Backlog' | 'In Progress' | 'Done'

export type Ticket = {
  id: string
  title: string
  owner: string
  status: TicketStatus
  updatedAt: string
}
