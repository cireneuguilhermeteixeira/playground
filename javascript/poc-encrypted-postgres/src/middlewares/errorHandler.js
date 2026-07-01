function errorHandler(error, req, res, next) {
  if (error.code === '23505') {
    return res.status(409).json({ message: 'CPF or nickname already exists' });
  }

  console.error(error);
  return res.status(500).json({ message: 'Internal server error' });
}

module.exports = errorHandler;
