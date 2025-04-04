import { FastifyRequest, FastifyReply } from 'fastify'
import bcrypt from 'bcryptjs'

export async function loginHandler(req: FastifyRequest, reply: FastifyReply) {
  const { email, password } = req.body as { email: string, password: string }

  const user = await req.server.prisma.user.findUnique({ where: { email } })
  if (!user) return reply.code(401).send({ error: 'Credenciais inválidas' })

  const isValid = await bcrypt.compare(password, user.passwordHash)
  if (!isValid) return reply.code(401).send({ error: 'Credenciais inválidas' })

  const accessToken = req.server.jwt.sign(
    { sub: user.id, role: user.role },
    { expiresIn: '15m' }
  )

  const refreshToken = req.server.jwt.sign(
    { sub: user.id },
    { expiresIn: '7d' }
  )

  // opcional: salvar refreshToken no banco
  await req.server.prisma.user.update({
    where: { id: user.id },
    data: { refreshToken }
  })

  return reply.send({ accessToken, refreshToken })
}

export async function refreshHandler(req: FastifyRequest, reply: FastifyReply) {
    const { refreshToken } = req.body as { refreshToken: string }
  
    try {
      const payload = req.server.jwt.verify(refreshToken) as { sub: number }
  
      const user = await req.server.prisma.user.findUnique({ where: { id: payload.sub } })
      if (!user || user.refreshToken !== refreshToken) {
        return reply.code(401).send({ error: 'Refresh token inválido' })
      }
  
      const newAccessToken = req.server.jwt.sign(
        { sub: user.id, role: user.role },
        { expiresIn: '15m' }
      )
  
      return reply.send({ accessToken: newAccessToken })
    } catch {
      return reply.code(401).send({ error: 'Token expirado ou inválido' })
    }
  }