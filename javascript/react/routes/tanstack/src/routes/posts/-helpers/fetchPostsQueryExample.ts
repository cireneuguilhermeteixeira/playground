type QueryExamplePost = {
  id: number
  title: string
}

const QUERY_EXAMPLE_POSTS: QueryExamplePost[] = [
  { id: 101, title: 'Understanding file-based routes' },
  { id: 102, title: 'Combining Router and Query cleanly' },
  { id: 103, title: 'Handling loading and errors in routes' },
]

export async function fetchPostsQueryExample() {
  await new Promise((resolve) => setTimeout(resolve, 700))
  return QUERY_EXAMPLE_POSTS
}

export type { QueryExamplePost }
