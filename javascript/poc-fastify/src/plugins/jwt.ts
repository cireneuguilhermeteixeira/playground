import fp from 'fastify-plugin';
import jwt from '@fastify/jwt';

declare module 'fastify' {
  interface FastifyInstance {
    auth: (req: any, reply: any) => Promise<void>;
  }
  interface FastifyRequest {
    user?: { sub: string; role?: string };
  }
}

export default fp(async (app) => {
  app.register(jwt, { secret: process.env.JWT_SECRET || 'devsecret' });

  app.decorate('auth', async (req, reply) => {
    try {
      await req.jwtVerify();
      // opcional: req.user = req.user || { ... }
    } catch {
      reply.code(401).send({ message: 'unauthorized' });
    }
  });
});
