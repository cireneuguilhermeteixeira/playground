import useSWR from 'swr'
import { getProfile, getProfileWithError } from './mockApi'

const PROFILE_KEY = 'profile'
const PROFILE_ERROR_KEY = 'profile-with-error'

function App() {
  return (
    <main className="page">
      <section className="card">
        <p className="label">Shared cache example</p>
        <h1>Two components, one cached request</h1>
        <p className="description">
          Both components below call `useSWR` with the same `key`. SWR fetches once, stores the
          result in cache, and the other component reads the same data.
        </p>

        <div className="content">
          <h2>What this example shows</h2>
          <ul>
            <li>The same `key` is used in both components.</li>
            <li>The first fetch populates the cache.</li>
            <li>The second component reads that cached value immediately.</li>
            <li>The `requestId` makes it obvious when a new fetch happened.</li>
          </ul>
        </div>

        <div className="examples">
          <ErrorExample />
          <ProfileCard />
          <ProfileSummary />
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
  const { data, isLoading, error } = useSWR(PROFILE_KEY, getProfile)

  return (
    <article className="result">
      <h2>Main component</h2>

      {isLoading ? <p>Loading profile...</p> : null}
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
  const { data, isLoading, error } = useSWR(PROFILE_KEY, getProfile)

  return (
    <article className="result">
      <h2>Shared cache preview</h2>

      {isLoading ? <p>Loading profile...</p> : null}
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
