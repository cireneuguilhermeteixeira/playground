import { FastifyRequest, FastifyReply } from 'fastify'

export async function authMiddleware(req: FastifyRequest, reply: FastifyReply) {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) throw new Error()

    const payload = await req.jwtVerify()
    req.user = payload

  } catch (err) {
    reply.code(401).send({ error: 'Token inválido ou ausente' })
  }
}