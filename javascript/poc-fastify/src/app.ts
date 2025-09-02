import { buildApp } from './server';
import cors from './plugins/cors';
import jwt from './plugins/jwt';
import swagger from './plugins/swagger';
import authRoutes from './routes/auth/routes';

export async function createApp() {
  const app = buildApp();

  await app.register(cors);
  await app.register(jwt);
  await app.register(swagger);

  app.get('/health', async () => ({ ok: true }));

  await app.register(authRoutes, { prefix: '/v1' });

  return app;
}
