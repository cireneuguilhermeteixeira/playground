export type Profile = {
  name: string
  role: string
  city: string
}

type MockResponse<T> = {
  ok: boolean
  status: number
  json: () => Promise<T>
}

export async function getProfile(): Promise<Profile> {
  const response = await mockFetchProfileSuccess()

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}.`)
  }

  return response.json()
}

export async function getProfileWithError(): Promise<Profile> {
  const response = await mockFetchProfileError()

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}.`)
  }

  return response.json()
}

async function mockFetchProfileSuccess(): Promise<MockResponse<Profile>> {
  await new Promise((resolve) => setTimeout(resolve, 800))

  return {
    ok: true,
    status: 200,
    json: async () => ({
      name: 'Diego',
      role: 'Frontend Developer',
      city: 'Fortaleza',
    }),
  }
}

async function mockFetchProfileError(): Promise<MockResponse<Profile>> {
  await new Promise((resolve) => setTimeout(resolve, 800))

  return {
    ok: false,
    status: 500,
    json: async () => {
      throw new Error('This body should not be read when the response is not ok.')
    },
  }
}
