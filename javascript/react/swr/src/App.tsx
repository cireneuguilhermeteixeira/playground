import useSWR from 'swr'
import { getProfile, getProfileWithError } from './mockApi'

const PROFILE_KEY = 'profile'
const PROFILE_ERROR_KEY = 'profile-with-error'
const PROFILE_FALLBACK_KEY = 'profile-fallback'
const PROFILE_COMPARE_KEY = 'profile-compare'
const FALLBACK_PROFILE = {
  requestId: 0,
  name: 'Loading...',
  role: 'Loading...',
  city: 'Loading...',
  updatedAt: 'Loading...',
}

function compareProfiles(
  previous:
    | {
        requestId: number
        name: string
        role: string
        city: string
        updatedAt: string
      }
    | undefined,
  next:
    | {
        requestId: number
        name: string
        role: string
        city: string
        updatedAt: string
      }
    | undefined,
) {
  if (!previous || !next) {
    return false
  }

  return (
    previous.name === next.name &&
    previous.role === next.role &&
    previous.city === next.city
  )
}

function App() {
  return (
    <main className="page">
      <section className="card">
        <p className="label">Shared cache and dedupe</p>
        <h1>Two components, one cached request</h1>
        <p className="description">
          Both components below call `useSWR` with the same `key`. SWR fetches once, stores the
          result in cache, and the other component reads the same data. Click refresh to see the
          difference between `isLoading` and `isValidating`. The last example shows request
          deduplication.
        </p>

        <div className="content">
          <h2>What this example shows</h2>
          <ul>
            <li>The same `key` is used in both components.</li>
            <li>The first fetch populates the cache.</li>
            <li>The second component reads that cached value immediately.</li>
            <li>The `requestId` makes it obvious when a new fetch happened.</li>
            <li>`isLoading` is for the first load; `isValidating` is for refetches.</li>
            <li>Requests started close together are deduped for a short interval.</li>
            <li>`fallbackData` can seed the UI before the real response arrives.</li>
            <li>`compare` decides whether a fresh response should trigger a rerender.</li>
          </ul>
        </div>

        <div className="examples">
          <ErrorExample />
          <ProfileCard />
          <ProfileSummary />
          <DedupingExample />
          <FallbackExample />
          <CompareExample />
        </div>
      </section>
    </main>
  )
}

export default App

function ErrorExample() {
  const { data, error, isLoading } = useSWR(PROFILE_ERROR_KEY, getProfileWithError)

  return (
    <article className="result">
      <h2>Error example</h2>

      {isLoading ? <p>Loading profile...</p> : null}
      {error ? <p>{error.message}</p> : null}
      {data ? <p>This should not render.</p> : null}
    </article>
  )
}

function ProfileCard() {
  const { data, isLoading, isValidating, error } = useSWR(PROFILE_KEY, getProfile)

  return (
    <article className="result">
      <h2>Main component</h2>

      {isLoading ? <p>Loading profile...</p> : null}
      {isValidating && !isLoading ? <p>Validating cached data...</p> : null}
      {error ? <p>Failed to load profile.</p> : null}

      {data ? (
        <div className="profile">
          <p>
            <strong>Request:</strong> #{data.requestId}
          </p>
          <p>
            <strong>Name:</strong> {data.name}
          </p>
          <p>
            <strong>Role:</strong> {data.role}
          </p>
          <p>
            <strong>City:</strong> {data.city}
          </p>
        </div>
      ) : null}
    </article>
  )
}

function ProfileSummary() {
  const { data, isLoading, isValidating, error } = useSWR(PROFILE_KEY, getProfile)

  return (
    <article className="result">
      <h2>Shared cache preview</h2>

      {isLoading ? <p>Loading profile...</p> : null}
      {isValidating && !isLoading ? <p>Updating from cache...</p> : null}
      {error ? <p>Failed to load profile.</p> : null}

      {data ? (
        <div className="profile">
          <p>
            This component did not make a second request. It reused cache entry #{data.requestId}.
          </p>
          <p>
            <strong>{data.name}</strong> works as a <strong>{data.role}</strong> in{' '}
            <strong>{data.city}</strong>.
          </p>
        </div>
      ) : null}
    </article>
  )
}

function DedupingExample() {
  return (
    <article className="result">
      <h2>Deduping example</h2>
      <p className="hint">
        These two components mount together with the same `key`. SWR starts one request and both
        readers reuse the same in-flight response.
      </p>

      <div className="dedupe-grid">
        <DedupedReader label="Reader A" />
        <DedupedReader label="Reader B" />
      </div>
    </article>
  )
}

function DedupedReader({ label }: { label: string }) {
  const { data, isLoading, isValidating } = useSWR(PROFILE_KEY, getProfile)

  return (
    <div className="dedupe-reader">
      <h3>{label}</h3>
      {isLoading ? <p>Loading profile...</p> : null}
      {isValidating && !isLoading ? <p>Updating profile...</p> : null}
      {data ? (
        <div className="profile">
          <p>
            Request id: <strong>#{data.requestId}</strong>
          </p>
          <p>
            <strong>{data.name}</strong> in <strong>{data.city}</strong>
          </p>
        </div>
      ) : null}
    </div>
  )
}

function FallbackExample() {
  const { data, isLoading, isValidating } = useSWR(PROFILE_FALLBACK_KEY, getProfile, {
    fallbackData: FALLBACK_PROFILE,
    revalidateOnMount: true,
  })

  return (
    <article className="result">
      <h2>Fallback data example</h2>
      <p className="hint">
        The UI shows placeholder data immediately, then SWR swaps it for the real response when the
        request finishes.
      </p>

      {isLoading ? <p>Loading real data...</p> : null}
      {isValidating && !isLoading ? <p>Refreshing with real data...</p> : null}

      {data ? (
        <div className="profile">
          <p>
            <strong>Request:</strong> #{data.requestId}
          </p>
          <p>
            <strong>Name:</strong> {data.name}
          </p>
          <p>
            <strong>Role:</strong> {data.role}
          </p>
          <p>
            <strong>City:</strong> {data.city}
          </p>
        </div>
      ) : null}
    </article>
  )
}

function CompareExample() {
  const { data, isLoading, isValidating } = useSWR(PROFILE_COMPARE_KEY, getProfile, {
    compare: compareProfiles,
  })

  return (
    <article className="result">
      <h2>Compare example</h2>
      <p className="hint">
        The response includes `updatedAt`, but the custom compare ignores it. That means SWR only
        rerenders when the meaningful fields change.
      </p>

      {isLoading ? <p>Loading profile...</p> : null}
      {isValidating && !isLoading ? <p>Checking for updates...</p> : null}

      {data ? (
        <div className="profile">
          <p>
            <strong>Request:</strong> #{data.requestId}
          </p>
          <p>
            <strong>Name:</strong> {data.name}
          </p>
          <p>
            <strong>Role:</strong> {data.role}
          </p>
          <p>
            <strong>City:</strong> {data.city}
          </p>
          <p>
            <strong>Updated at:</strong> {data.updatedAt}
          </p>
        </div>
      ) : null}
    </article>
  )
}
