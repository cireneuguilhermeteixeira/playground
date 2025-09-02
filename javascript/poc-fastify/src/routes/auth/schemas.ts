import { z } from 'zod';
export const LoginBody = z.object({ email: z.string().email(), password: z.string().min(6) });
export type LoginBody = z.infer<typeof LoginBody>;

// JSON Schema p/ Swagger:
export const LoginBodySchema = {
  $id: 'LoginBody',
  type: 'object',
  properties: {
    email: { type: 'string', format: 'email' },
    password: { type: 'string', minLength: 6 }
  },
  required: ['email', 'password']
} as const;
