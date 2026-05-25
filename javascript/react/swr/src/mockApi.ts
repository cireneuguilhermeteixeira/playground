export type Profile = {
  name: string
  role: string
  city: string
}

export async function getProfile(): Promise<Profile> {
  await new Promise((resolve) => setTimeout(resolve, 800))

  return {
    name: 'Diego',
    role: 'Frontend Developer',
    city: 'Fortaleza',
  }
}

export async function getProfileWithError(): Promise<Profile> {
  await new Promise((resolve) => setTimeout(resolve, 800))

  throw new Error('The server could not return the profile.')
}
