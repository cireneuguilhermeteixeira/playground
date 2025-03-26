import { FastifyRequest, FastifyReply } from 'fastify'

export async function requestLogger(req: FastifyRequest, reply: FastifyReply) {
  req.log.info(`➡️ [${req.method}] ${req.url}`)
}