import type { RegistrationsPage } from '../types/registration'

export async function fetchBackendRegistrationsPage(
  pageIndex: number,
  pageSize: number,
): Promise<RegistrationsPage> {
  const searchParams = new URLSearchParams({
    page: String(pageIndex + 1),
    pageSize: String(pageSize),
  })

  const response = await fetch(`/api/registrations?${searchParams.toString()}`)

  if (!response.ok) {
    throw new Error(`Backend request failed with status ${response.status}`)
  }

  return response.json() as Promise<RegistrationsPage>
}
