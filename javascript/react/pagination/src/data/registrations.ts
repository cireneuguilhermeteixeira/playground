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

const TOTAL_ITEMS = 10000
const categories: Registration['category'][] = [
  'Docs',
  'Billing',
  'Checkout',
  'Auth',
]
const statuses: Registration['status'][] = ['Ready', 'Review', 'Draft']

export const registrations: Registration[] = Array.from(
  { length: TOTAL_ITEMS },
  (_, index) => {
    const itemNumber = index + 1

    return {
      id: `ITEM-${itemNumber.toString().padStart(5, '0')}`,
      title: `Registration ${itemNumber}`,
      category: categories[index % categories.length],
      status: statuses[index % statuses.length],
      updatedAt: `2026-03-${String((index % 28) + 1).padStart(2, '0')}`,
    }
  },
)

export const registrationsTotal = registrations.length

export async function fetchRegistrationsPage(
  pageIndex: number,
  pageSize: number,
): Promise<RegistrationsPage> {
  const start = pageIndex * pageSize
  const end = start + pageSize

  await new Promise((resolve) => {
    window.setTimeout(resolve, 350)
  })

  return {
    rows: registrations.slice(start, end),
    rowCount: registrations.length,
    pageCount: Math.ceil(registrations.length / pageSize),
  }
}
