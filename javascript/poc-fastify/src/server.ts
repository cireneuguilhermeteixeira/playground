import Fastify from 'fastify'
import jwt from '@fastify/jwt'
import db from './plugins/db'
import { userRoutes } from './routes/users'
import cookie from '@fastify/cookie'
import session from '@fastify/session'

import dotenv from 'dotenv'
dotenv.config()


const app = Fastify()

app.register(jwt, {
  secret: process.env.JWT_SECRET as string
})

app.register(cookie)
app.register(session, {
  secret: process.env.SESSION_SECRET as string,
  cookie: {
    secure: false,
    maxAge: 1000 * 60 * 60 * 1, // 1 hour
  }
})

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
