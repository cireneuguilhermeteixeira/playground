import { FastifyInstance } from 'fastify'
import { authMiddleware } from '../middlewares/auth'
import { requestLogger } from '../middlewares/logger'
import { USER_SCHEMA } from '../schemas/user'


export async function userRoutes(app: FastifyInstance) {
  
  app.addHook('onRequest', requestLogger)
  app.addHook('preHandler', authMiddleware)
  
  app.get('/users', USER_SCHEMA, async (req, res) => {
    return app.prisma.user.findMany()
  })

  app.post('/users', async (req, res) => {
    const { name, email } = req.body as { name: string; email: string }
    const user = await app.prisma.user.create({ data: { name, email } })
    return user
  })
}