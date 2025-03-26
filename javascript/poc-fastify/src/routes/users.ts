import { FastifyInstance } from 'fastify'

export async function userRoutes(app: FastifyInstance) {
  app.get('/users', async (req, res) => {
    return app.prisma.user.findMany()
  })

  app.post('/users', async (req, res) => {
    const { name, email } = req.body as { name: string; email: string }
    const user = await app.prisma.user.create({ data: { name, email } })
    return user
  })
}