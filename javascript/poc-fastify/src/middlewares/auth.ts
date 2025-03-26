import { FastifyRequest, FastifyReply } from 'fastify'

export async function authMiddleware(req: FastifyRequest, reply: FastifyReply) {
  const auth = (req.body as any)?.auth

  if (auth !== '123') {
    reply.code(401).send({ error: 'Unauthorized' })
  }
}