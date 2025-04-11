import Fastify from 'fastify'
import swagger from '@fastify/swagger'
import swaggerUI from '@fastify/swagger-ui'
import jwt from '@fastify/jwt'
import db from './plugins/db'
import { userRoutes } from './routes/users'

import dotenv from 'dotenv'
dotenv.config()


const app = Fastify()

app.register(jwt, {
  secret: process.env.JWT_SECRET as string
})



app.register(swagger, {
  swagger: {
    info: {
      title: 'Fastify POC API',
      description: 'Documentation for API with Swagger',
      version: '1.0.0',
    },
    host: 'localhost:3000',
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json'],
  }
})

app.register(swaggerUI, {
  routePrefix: '/docs', 
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false
  },
})


app.addHook('onRequest', async (req, reply) => {
  req.log.info(`➡️ [${req.method}] ${req.url}`)
  req.startTime = Date.now()
})

app.addHook('onResponse', async (req, reply) => {
  const time = Date.now() - req.startTime
  req.log.info(`⬅️ Respondido em ${time}ms`)
})




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
