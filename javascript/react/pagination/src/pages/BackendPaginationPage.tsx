import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
} from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { fetchBackendRegistrationsPage } from '../services/backendRegistrations'
import type { Registration } from '../types/registration'

const defaultData: Registration[] = []

export function BackendPaginationPage() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 15,
  })

  const registrationsQuery = useQuery({
    queryKey: ['backend-registrations', pagination.pageIndex, pagination.pageSize],
    queryFn: () =>
      fetchBackendRegistrationsPage(pagination.pageIndex, pagination.pageSize),
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
        <p className="eyebrow">Backend pagination</p>
        <h1>Real pagination fetched from Node</h1>
        <p className="lead">
          The client sends <code>page</code> and <code>pageSize</code> to a Node
          API. The backend keeps the large dataset in memory and returns only the
          current slice for TanStack Query and Table.
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
              {[15, 30, 60].map((pageSize) => (
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
            <p className="eyebrow">Backend response</p>
            <h2>
              Rows {firstRow} to {lastRow}
            </h2>
          </div>
          <p className="hint">
            The browser never receives the full array. Each query requests only one
            page from the Node service and the previous page stays visible while the
            next one loads.
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
        )}

        <div className="table-footer">
          <span>
            {registrationsQuery.isFetching ? 'Loading backend page...' : 'Backend page ready'}
          </span>
          <span>
            Request params: page={pagination.pageIndex + 1} / pageSize={pagination.pageSize}
          </span>
        </div>
      </section>
    </>
  )
}
