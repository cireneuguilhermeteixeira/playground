import { useMemo, useState } from 'react'
import { List } from 'react-window'
import './App.css'

const TOTAL_ITEMS = 10000
const PAGE_SIZE = 250
const ROW_HEIGHT = 96
const LIST_HEIGHT = 420

const dataset = Array.from({ length: TOTAL_ITEMS }, (_, index) => {
  const itemNumber = index + 1
  const category = ['Docs', 'Billing', 'Checkout', 'Auth'][index % 4]
  const status = ['Ready', 'Review', 'Draft'][index % 3]

  return {
    id: `ITEM-${itemNumber.toString().padStart(5, '0')}`,
    title: `Registro ${itemNumber}`,
    category,
    status,
    updatedAt: `2026-03-${String((index % 28) + 1).padStart(2, '0')}`,
  }
})

function Row({ index, style, items, ariaAttributes }) {
  const item = items[index]

  return (
    <article className="row" style={style} {...ariaAttributes}>
      <div>
        <p className="row__eyebrow">{item.id}</p>
        <h3>{item.title}</h3>
      </div>
      <dl className="row__meta">
        <div>
          <dt>Categoria</dt>
          <dd>{item.category}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{item.status}</dd>
        </div>
        <div>
          <dt>Atualizado</dt>
          <dd>{item.updatedAt}</dd>
        </div>
      </dl>
    </article>
  )
}

function App() {
  const [page, setPage] = useState(1)
  const totalPages = Math.ceil(TOTAL_ITEMS / PAGE_SIZE)

  const currentItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return dataset.slice(start, start + PAGE_SIZE)
  }, [page])

  const firstItemNumber = (page - 1) * PAGE_SIZE + 1
  const lastItemNumber = firstItemNumber + currentItems.length - 1

  return (
    <main className="app">
      <section className="hero">
        <p className="eyebrow">React pagination POC</p>
        <h1>Paginacao com react-window</h1>
        <p className="lead">
          A pagina controla qual bloco do dataset sera exibido. O{' '}
          <code>react-window</code> renderiza apenas as linhas visiveis dentro da
          pagina atual.
        </p>
      </section>

      <section className="panel">
        <div className="stats">
          <article>
            <span>Dataset total</span>
            <strong>{TOTAL_ITEMS.toLocaleString('pt-BR')} itens</strong>
          </article>
          <article>
            <span>Tamanho da pagina</span>
            <strong>{PAGE_SIZE} registros</strong>
          </article>
          <article>
            <span>Pagina atual</span>
            <strong>
              {page} / {totalPages}
            </strong>
          </article>
        </div>

        <div className="controls">
          <button type="button" onClick={() => setPage(1)} disabled={page === 1}>
            Primeira
          </button>
          <button
            type="button"
            onClick={() => setPage((currentPage) => currentPage - 1)}
            disabled={page === 1}
          >
            Anterior
          </button>

          <label className="page-picker">
            <span>Ir para</span>
            <select
              value={page}
              onChange={(event) => setPage(Number(event.target.value))}
            >
              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (pageNumber) => (
                  <option key={pageNumber} value={pageNumber}>
                    Pagina {pageNumber}
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
            Proxima
          </button>
          <button
            type="button"
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
          >
            Ultima
          </button>
        </div>

        <div className="panel__header">
          <div>
            <p className="eyebrow">Slice atual</p>
            <h2>
              Itens {firstItemNumber} a {lastItemNumber}
            </h2>
          </div>
          <p className="hint">
            Apesar de a pagina ter {currentItems.length} itens, o DOM so recebe o
            necessario para preencher a viewport.
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
    </main>
  )
}

export default App
