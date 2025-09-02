import Fastify from 'fastify';

export function buildApp() {
  const app = Fastify({ logger: true });
  return app;
}

if (require.main === module) {
  const app = buildApp();
  app.listen({ port: 3000, host: '0.0.0.0' });
}