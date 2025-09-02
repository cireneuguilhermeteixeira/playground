import { describe, it, expect, beforeAll } from 'vitest';
import { createApp } from '../../app';

let app: Awaited<ReturnType<typeof createApp>>;

beforeAll(async () => { app = await createApp(); });

describe('Auth', () => {
  it('login returns a token', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/auth/login',
      payload: { email: 'a@a.com', password: '123456' }
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().token).toBeTypeOf('string');
  });
});
