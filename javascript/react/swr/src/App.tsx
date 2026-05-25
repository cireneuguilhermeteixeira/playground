import useSWR from 'swr'
import { getProfile, getProfileWithError } from './mockApi'

const PROFILE_KEY = 'profile'
const PROFILE_ERROR_KEY = 'profile-with-error'

function App() {
  const { data, error, isLoading } = useSWR(PROFILE_KEY, getProfile)
  const {
    data: failedData,
    error: failedError,
    isLoading: failedLoading,
  } = useSWR(PROFILE_ERROR_KEY, getProfileWithError)

  return (
    <main className="page">
      <section className="card">
        <p className="label">First practical SWR example</p>
        <h1>Loading data in the simplest way</h1>
        <p className="description">
          This example uses a single `key`, a single `fetcher`, and `useSWR` to load data and
          handle the basic states automatically. It also shows how SWR receives an error.
        </p>

        <div className="content">
          <h2>What SWR is doing here</h2>
          <ul>
            <li>The `key` identifies this data in the cache.</li>
            <li>The `fetcher` is the async function that returns the data.</li>
            <li>`useSWR` gives us `data`, `error`, and `isLoading`.</li>
            <li>If the `fetcher` throws or rejects, SWR fills `error` automatically.</li>
          </ul>
        </div>

        <div className="examples">
          <div className="result">
            <h2>Success example</h2>

            {isLoading ? <p>Loading profile...</p> : null}
            {error ? <p>Failed to load profile.</p> : null}

            {data ? (
              <div className="profile">
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
          </div>

          <div className="result">
            <h2>Error example</h2>

            {failedLoading ? <p>Loading profile...</p> : null}
            {failedError ? <p>{failedError.message}</p> : null}
            {failedData ? <p>This should not render.</p> : null}
          </div>
        </div>
      </section>
    </main>
  )
}

export default App
