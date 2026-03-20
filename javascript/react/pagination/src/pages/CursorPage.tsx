import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { fetchBackendRegistrationsCursorPage } from '../services/backendRegistrations'
import type { Registration } from '../types/registration'

const defaultData: Registration[] = []

export function CursorPage() {
  const [pageSize, setPageSize] = useState<number>(15)
  const [pageIndex, setPageIndex] = useState<number>(0)
  const [cursorTrail, setCursorTrail] = useState<Array<string | null>>([null])

  const currentCursor = cursorTrail[pageIndex] ?? null

  const registrationsQuery = useQuery({
    queryKey: ['backend-registrations-cursor', currentCursor, pageSize],
    queryFn: () => fetchBackendRegistrationsCursorPage(currentCursor, pageSize),
    placeholderData: keepPreviousData,
  })

  const currentRows = registrationsQuery.data?.rows ?? defaultData
  const firstRow = pageIndex * pageSize + 1
  const lastRow = firstRow + currentRows.length - 1
  const canGoPrevious = pageIndex > 0
  const canGoNext = Boolean(registrationsQuery.data?.hasMore && registrationsQuery.data.nextCursor)
  const nextCursor = registrationsQuery.data?.nextCursor ?? null

  const requestLabel = useMemo(() => {
    if (currentCursor === null) {
      return 'cursor=null'
    }

    return `cursor=${currentCursor}`
  }, [currentCursor])

  function handleNextPage() {
    if (!nextCursor) {
      return
    }

    setCursorTrail((currentTrail) => {
      const nextTrail = currentTrail.slice(0, pageIndex + 1)
      nextTrail.push(nextCursor)
      return nextTrail
    })
    setPageIndex((currentPageIndex) => currentPageIndex + 1)
  }

  function handlePreviousPage() {
    if (!canGoPrevious) {
      return
    }

    setPageIndex((currentPageIndex) => currentPageIndex - 1)
  }

  function handlePageSizeChange(nextPageSize: number) {
    setPageSize(nextPageSize)
    setPageIndex(0)
    setCursorTrail([null])
  }

  return (
    <>
      <section className="hero">
        <p className="eyebrow">Cursor pagination</p>
        <h1>Server-side cursor pagination with Query</h1>
        <p className="lead">
          The client no longer asks for page numbers. Instead, it sends the last
          seen item ID as a cursor, and the backend returns the next stable slice.
        </p>
      </section>

      <section className="panel">
        <div className="stats">
          <article>
            <span>Total rows</span>
            <strong>{(registrationsQuery.data?.rowCount ?? 0).toLocaleString('pt-BR')} items</strong>
          </article>
          <article>
            <span>Page size</span>
            <strong>{pageSize} records</strong>
          </article>
          <article>
            <span>Current page</span>
            <strong>Page {pageIndex + 1}</strong>
          </article>
        </div>

        <div className="controls">
          <button type="button" onClick={handlePreviousPage} disabled={!canGoPrevious}>
            Previous
          </button>

          <label className="page-picker">
            <span>Rows</span>
            <select
              value={pageSize}
              onChange={(event) => handlePageSizeChange(Number(event.target.value))}
            >
              {[15, 30, 60].map((size) => (
                <option key={size} value={size}>
                  {size} per page
                </option>
              ))}
            </select>
          </label>

          <button type="button" onClick={handleNextPage} disabled={!canGoNext}>
            Next
          </button>
        </div>

        <div className="panel__header">
          <div>
            <p className="eyebrow">Backend response</p>
            <h2>
              Rows {currentRows.length === 0 ? 0 : firstRow} to {currentRows.length === 0 ? 0 : lastRow}
            </h2>
          </div>
          <p className="hint">
            This flow is sequential. The server advances from one stable marker to
            the next, which avoids large offsets and handles changing datasets more
            predictably.
          </p>
        </div>

        {registrationsQuery.isError ? (
          <div className="error-box">
            <strong>Could not reach the backend.</strong>
            <span>Start the Node API with `npm run server` and reload this page.</span>
          </div>
        ) : (
          <div className="table-shell">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{row.title}</td>
                    <td>{row.category}</td>
                    <td>{row.status}</td>
                    <td>{row.updatedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="table-footer">
          <span>
            {registrationsQuery.isFetching ? 'Loading cursor page...' : 'Cursor page ready'}
          </span>
          <span>Request params: {requestLabel} / pageSize={pageSize}</span>
        </div>
      </section>
    </>
  )
}
