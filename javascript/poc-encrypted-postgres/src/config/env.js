require('dotenv').config();

const env = {
  port: Number(process.env.PORT || 3000),
  databaseUrl: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/users_poc',
  encryptionKeyBase64: process.env.ENCRYPTION_KEY_BASE64,
};

module.exports = env;
