export const USER_SCHEMA =  {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string' },
          password: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' }
          }
        }
      },
      tags: ['Auth'],
      summary: 'Login do usuário',
      description: 'Realiza login e retorna tokens JWT'
    }
};