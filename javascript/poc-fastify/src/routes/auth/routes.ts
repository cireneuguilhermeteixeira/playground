import { FastifyInstance } from 'fastify';
import { LoginBodySchema } from './schemas';

export default async function authRoutes(app: FastifyInstance) {
  app.addSchema(LoginBodySchema);

  app.post('/auth/login', {
    schema: {
      body: { $ref: 'LoginBody#' },
      response: { 200: { type: 'object', properties: { token: { type: 'string' } } } },
      tags: ['auth']
    }
  }, app.withTypeProvider().bind(app, (req, reply) => (app as any).loginHandler?.call(app, req)));
}
