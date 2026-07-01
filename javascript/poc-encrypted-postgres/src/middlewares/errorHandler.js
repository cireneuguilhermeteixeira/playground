function errorHandler(error, req, res, next) {
  if (error.code === '23505') {
    return res.status(409).json({ message: 'CPF or nickname already exists' });
  }

  if (error.message === 'ENCRYPTION_KEY_BASE64 is required') {
    return res.status(500).json({ message: 'Encryption key is not configured' });
  }

  if (error.message === 'ENCRYPTION_KEY_BASE64 must decode to exactly 32 bytes') {
    return res.status(500).json({ message: 'Encryption key is invalid' });
  }

  console.error(error);
  return res.status(500).json({ message: 'Internal server error' });
}

module.exports = errorHandler;
