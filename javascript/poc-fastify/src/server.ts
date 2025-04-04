import Fastify from 'fastify'
import jwt from '@fastify/jwt'
import db from './plugins/db'
import { userRoutes } from './routes/users'

const app = Fastify()

app.addHook('onRequest', async (req, reply) => {
  req.log.info(`➡️ [${req.method}] ${req.url}`)
  req.startTime = Date.now()
})

app.addHook('onResponse', async (req, reply) => {
  const time = Date.now() - req.startTime
  req.log.info(`⬅️ Respondido em ${time}ms`)
})



app.decorateRequest('userId', null)


app.register(db)
app.register(userRoutes)

app.listen({ port: 3000 }, (err, address) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
  console.log(`🚀 Server listening at ${address}`)
})

declare module 'fastify' {
  interface FastifyRequest {
    startTime: number
    userId: number | null
  }
}
