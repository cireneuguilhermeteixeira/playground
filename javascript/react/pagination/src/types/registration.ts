export type Registration = {
  id: string
  title: string
  category: 'Docs' | 'Billing' | 'Checkout' | 'Auth'
  status: 'Ready' | 'Review' | 'Draft'
  updatedAt: string
}

export type RegistrationsPage = {
  rows: Registration[]
  rowCount: number
  pageCount: number
}

export type CursorRegistrationsPage = {
  rows: Registration[]
  nextCursor: string | null
  hasMore: boolean
  rowCount: number
}
