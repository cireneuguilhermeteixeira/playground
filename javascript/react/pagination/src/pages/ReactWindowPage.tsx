import { useMemo, useState } from 'react'
import { List, type RowComponentProps } from 'react-window'
import { registrations, registrationsTotal, type Registration } from '../data/registrations'

type RowProps = {
  items: Registration[]
}

const PAGE_SIZE = 10000
const ROW_HEIGHT = 96
const LIST_HEIGHT = 420

function Row({
  index,
  style,
  items,
  ariaAttributes,
}: RowComponentProps<RowProps>) {
  const item = items[index]

  return (
    <article className="row" style={style} {...ariaAttributes}>
      <div>
        <p className="row__eyebrow">{item.id}</p>
        <h3>{item.title}</h3>
      </div>
      <dl className="row__meta">
        <div>
          <dt>Category</dt>
          <dd>{item.category}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{item.status}</dd>
        </div>
        <div>
          <dt>Updated</dt>
          <dd>{item.updatedAt}</dd>
        </div>
      </dl>
    </article>
  )
}

export function ReactWindowPage() {
  const [page, setPage] = useState<number>(1)
  const totalPages = Math.ceil(registrationsTotal / PAGE_SIZE)

  const currentItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return registrations.slice(start, start + PAGE_SIZE)
  }, [page])

  const firstItemNumber = (page - 1) * PAGE_SIZE + 1
  const lastItemNumber = firstItemNumber + currentItems.length - 1

  return (
    <>
      <section className="hero">
        <p className="eyebrow">React pagination POC</p>
        <h1>Pagination with react-window</h1>
        <p className="lead">
          The page controls which block of the dataset will be displayed. The{' '}
          <code>react-window</code> renders only the visible rows within the
          current page.
        </p>
      </section>

      <section className="panel">
        <div className="stats">
          <article>
            <span>Dataset total</span>
            <strong>{registrationsTotal.toLocaleString('pt-BR')} items</strong>
          </article>
          <article>
            <span>Page size</span>
            <strong>{PAGE_SIZE} records</strong>
          </article>
          <article>
            <span>Current page</span>
            <strong>
              {page} / {totalPages}
            </strong>
          </article>
        </div>

        <div className="controls">
          <button type="button" onClick={() => setPage(1)} disabled={page === 1}>
            First
          </button>
          <button
            type="button"
            onClick={() => setPage((currentPage) => currentPage - 1)}
            disabled={page === 1}
          >
            Previous
          </button>

          <label className="page-picker">
            <span>Go to</span>
            <select
              value={page}
              onChange={(event) => setPage(Number(event.target.value))}
            >
              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (pageNumber) => (
                  <option key={pageNumber} value={pageNumber}>
                    Page {pageNumber}
                  </option>
                ),
              )}
            </select>
          </label>

          <button
            type="button"
            onClick={() => setPage((currentPage) => currentPage + 1)}
            disabled={page === totalPages}
          >
            Next
          </button>
          <button
            type="button"
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
          >
            Last
          </button>
        </div>

        <div className="panel__header">
          <div>
            <p className="eyebrow">Current slice</p>
            <h2>
              Items {firstItemNumber} to {lastItemNumber}
            </h2>
          </div>
          <p className="hint">
            Even though the page has {currentItems.length} items, the DOM only
            receives what&apos;s necessary to fill the viewport.
          </p>
        </div>

        <div className="list-shell">
          <List
            rowComponent={Row}
            rowCount={currentItems.length}
            rowHeight={ROW_HEIGHT}
            rowProps={{ items: currentItems }}
            style={{ height: LIST_HEIGHT }}
          />
        </div>
      </section>
    </>
  )
}
