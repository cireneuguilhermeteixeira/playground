import fp from 'fastify-plugin';
import cors from '@fastify/cors';

export default fp(async (app) => {
  await app.register(cors, {
    origin: [/\.meudominio\.com$/, 'http://localhost:5173'],
    credentials: true,
    // hook: 'preHandler'
  });
});