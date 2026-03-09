import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
} from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import {
  fetchRegistrationsPage,
  type Registration,
} from '../data/registrations'

const defaultData: Registration[] = []

export function TanStackPage() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 12,
  })

  const registrationsQuery = useQuery({
    queryKey: ['registrations', pagination.pageIndex, pagination.pageSize],
    queryFn: () =>
      fetchRegistrationsPage(pagination.pageIndex, pagination.pageSize),
    placeholderData: keepPreviousData,
  })

  const columns = useMemo<ColumnDef<Registration>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
      },
      {
        accessorKey: 'title',
        header: 'Title',
      },
      {
        accessorKey: 'category',
        header: 'Category',
      },
      {
        accessorKey: 'status',
        header: 'Status',
      },
      {
        accessorKey: 'updatedAt',
        header: 'Updated',
      },
    ],
    [],
  )

  const table = useReactTable({
    data: registrationsQuery.data?.rows ?? defaultData,
    columns,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    rowCount: registrationsQuery.data?.rowCount ?? 0,
  })

  const rowCount = registrationsQuery.data?.rowCount ?? 0
  const pageCount = table.getPageCount()
  const firstRow = rowCount === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1
  const lastRow = Math.min(
    rowCount,
    (pagination.pageIndex + 1) * pagination.pageSize,
  )

  return (
    <>
      <section className="hero">
        <p className="eyebrow">TanStack demo</p>
        <h1>Server-style pagination with Query and Table</h1>
        <p className="lead">
          <code>@tanstack/react-query</code> fetches one page at a time, and{' '}
          <code>@tanstack/react-table</code> renders the current rows with manual
          pagination state.
        </p>
      </section>

      <section className="panel">
        <div className="stats">
          <article>
            <span>Total rows</span>
            <strong>{rowCount.toLocaleString('pt-BR')} items</strong>
          </article>
          <article>
            <span>Page size</span>
            <strong>{pagination.pageSize} records</strong>
          </article>
          <article>
            <span>Current page</span>
            <strong>
              {pagination.pageIndex + 1} / {Math.max(pageCount, 1)}
            </strong>
          </article>
        </div>

        <div className="controls">
          <button
            type="button"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            First
          </button>
          <button
            type="button"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </button>

          <label className="page-picker">
            <span>Rows</span>
            <select
              value={pagination.pageSize}
              onChange={(event) => table.setPageSize(Number(event.target.value))}
            >
              {[12, 24, 48].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize} per page
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </button>
          <button
            type="button"
            onClick={() => table.setPageIndex(Math.max(pageCount - 1, 0))}
            disabled={!table.getCanNextPage()}
          >
            Last
          </button>
        </div>

        <div className="panel__header">
          <div>
            <p className="eyebrow">Current response</p>
            <h2>
              Rows {firstRow} to {lastRow}
            </h2>
          </div>
          <p className="hint">
            Query keeps previous data visible while the next page loads, and
            Table stays in sync with the controlled pagination state.
          </p>
        </div>

        <div className="table-shell">
          <table className="data-table">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <span>
            {registrationsQuery.isFetching ? 'Loading page...' : 'Page ready'}
          </span>
          <span>
            Cached key: {pagination.pageIndex + 1} / {pagination.pageSize}
          </span>
        </div>
      </section>
    </>
  )
}
