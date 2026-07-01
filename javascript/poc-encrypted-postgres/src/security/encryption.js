const crypto = require('crypto');
const env = require('../config/env');

const ALGORITHM = 'aes-256-gcm';
const AUTH_TAG_LENGTH = 16;
const IV_LENGTH = 12;
const KEY_LENGTH = 32;

function getEncryptionKey() {
  if (!env.encryptionKeyBase64) {
    throw new Error('ENCRYPTION_KEY_BASE64 is required');
  }

  const key = Buffer.from(env.encryptionKeyBase64, 'base64');

  if (key.length !== KEY_LENGTH) {
    throw new Error('ENCRYPTION_KEY_BASE64 must decode to exactly 32 bytes');
  }

  return key;
}

function encrypt(value) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  const encrypted = Buffer.concat([
    cipher.update(String(value), 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return [
    iv.toString('base64'),
    authTag.toString('base64'),
    encrypted.toString('base64'),
  ].join(':');
}

function decrypt(encryptedValue) {
  const [iv, authTag, encrypted] = encryptedValue.split(':');

  if (!iv || !authTag || !encrypted) {
    throw new Error('Invalid encrypted value format');
  }

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    getEncryptionKey(),
    Buffer.from(iv, 'base64'),
    { authTagLength: AUTH_TAG_LENGTH },
  );

  decipher.setAuthTag(Buffer.from(authTag, 'base64'));

  return Buffer.concat([
    decipher.update(Buffer.from(encrypted, 'base64')),
    decipher.final(),
  ]).toString('utf8');
}

function hashForLookup(value) {
  return crypto
    .createHash('sha256')
    .update(String(value).trim().toLowerCase())
    .digest('hex');
}

module.exports = {
  decrypt,
  encrypt,
  hashForLookup,
};
