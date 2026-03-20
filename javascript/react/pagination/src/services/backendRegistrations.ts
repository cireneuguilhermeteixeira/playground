import type {
  CursorRegistrationsPage,
  RegistrationsPage,
} from '../types/registration'

export async function fetchBackendRegistrationsOffsetPage(
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

export async function fetchBackendRegistrationsCursorPage(
  cursor: string | null,
  pageSize: number,
): Promise<CursorRegistrationsPage> {
  const searchParams = new URLSearchParams({
    pageSize: String(pageSize),
  })

  if (cursor) {
    searchParams.set('cursor', cursor)
  }

  const response = await fetch(`/api/registrations-cursor?${searchParams.toString()}`)

  if (!response.ok) {
    throw new Error(`Backend request failed with status ${response.status}`)
  }

  return response.json() as Promise<CursorRegistrationsPage>
}
