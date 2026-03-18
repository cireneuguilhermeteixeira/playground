import { createServer } from 'node:http'
import { URL } from 'node:url'

const PORT = Number(process.env.PORT ?? 3001)
const TOTAL_ITEMS = 50000
const categories = ['Docs', 'Billing', 'Checkout', 'Auth']
const statuses = ['Ready', 'Review', 'Draft']

const registrations = Array.from({ length: TOTAL_ITEMS }, (_, index) => {
  const itemNumber = index + 1

  return {
    id: `API-${itemNumber.toString().padStart(6, '0')}`,
    title: `Backend registration ${itemNumber}`,
    category: categories[index % categories.length],
    status: statuses[index % statuses.length],
    updatedAt: `2026-03-${String((index % 28) + 1).padStart(2, '0')}`,
  }
})

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  })

  response.end(JSON.stringify(payload))
}

function parsePositiveInteger(value, fallback) {
  const parsed = Number.parseInt(value ?? '', 10)

  if (Number.isNaN(parsed) || parsed <= 0) {
    return fallback
  }

  return parsed
}

const server = createServer(async (request, response) => {
  if (!request.url) {
    sendJson(response, 400, { message: 'Missing request URL' })
    return
  }

  if (request.method === 'OPTIONS') {
    response.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    })
    response.end()
    return
  }

  const url = new URL(request.url, `http://${request.headers.host}`)

  if (request.method === 'GET' && url.pathname === '/api/registrations') {
    const page = parsePositiveInteger(url.searchParams.get('page'), 1)
    const pageSize = Math.min(
      parsePositiveInteger(url.searchParams.get('pageSize'), 15),
      100,
    )

    const start = (page - 1) * pageSize
    const end = start + pageSize

    await new Promise((resolve) => {
      setTimeout(resolve, 450)
    })

    sendJson(response, 200, {
      rows: registrations.slice(start, end),
      rowCount: registrations.length,
      pageCount: Math.ceil(registrations.length / pageSize),
    })
    return
  }

  sendJson(response, 404, { message: 'Route not found' })
})

server.listen(PORT, () => {
  console.log(`Pagination API running at http://localhost:${PORT}`)
})
