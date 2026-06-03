export type Profile = {
  requestId: number
  name: string
  role: string
  city: string
  updatedAt: string
}

export type CompareRecord = {
  label: string
  version: number
  updatedAt: string
}

export type Comment = {
  id: number
  author: string
  text: string
  createdAt: string
}

export type CommentPage = {
  items: Comment[]
  page: number
  pageSize: number
  hasMore: boolean
}

type MockResponse<T> = {
  ok: boolean
  status: number
  json: () => Promise<T>
}

let requestCount = 0
let lastUpdatedAt = '2026-05-27T00:00:00.000Z'
let commentId = 4
const comments: Comment[] = [
  {
    id: 1,
    author: 'Ana',
    text: 'SWR keeps the UI simple.',
    createdAt: '2026-05-27T08:00:00.000Z',
  },
  {
    id: 2,
    author: 'Bruno',
    text: 'Mutation is separate from fetching.',
    createdAt: '2026-05-27T08:05:00.000Z',
  },
  {
    id: 3,
    author: 'Carla',
    text: 'Infinite loading can be incremental.',
    createdAt: '2026-05-27T08:10:00.000Z',
  },
]

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

export async function getCompareRecord(): Promise<CompareRecord> {
  await new Promise((resolve) => setTimeout(resolve, 800))

  return {
    label: 'Stable label',
    version: 1,
    updatedAt: new Date().toISOString(),
  }
}

export async function getComments(page: number, pageSize = 2): Promise<CommentPage> {
  await new Promise((resolve) => setTimeout(resolve, 700))

  const start = (page - 1) * pageSize
  const items = comments.slice(start, start + pageSize)

  return {
    items,
    page,
    pageSize,
    hasMore: start + pageSize < comments.length,
  }
}

export async function createComment(input: { author: string; text: string }): Promise<Comment> {
  await new Promise((resolve) => setTimeout(resolve, 700))

  const newComment: Comment = {
    id: commentId++,
    author: input.author,
    text: input.text,
    createdAt: new Date().toISOString(),
  }

  comments.unshift(newComment)

  return newComment
}

async function mockFetchProfileSuccess(): Promise<MockResponse<Profile>> {
  await new Promise((resolve) => setTimeout(resolve, 800))
  requestCount += 1
  lastUpdatedAt = new Date().toISOString()

  return {
    ok: true,
    status: 200,
    json: async () => ({
      requestId: requestCount,
      name: 'Diego',
      role: 'Frontend Developer',
      city: 'Fortaleza',
      updatedAt: lastUpdatedAt,
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
