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
