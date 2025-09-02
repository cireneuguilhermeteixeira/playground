import { FastifyInstance, FastifyRequest } from 'fastify';
import { LoginBody } from './schemas';

export async function loginHandler(this: FastifyInstance, req: FastifyRequest<{ Body: LoginBody }>) {
  const { email } = req.body;
  // checar credenciais no seu serviço/BD...
  const token = await this.jwt.sign({ sub: email, role: 'user' });
  return { token };
}
