const { checkDatabase } = require('../db/health');

async function healthCheck(req, res, next) {
  try {
    await checkDatabase();
    res.json({ status: 'ok', database: 'ok' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  healthCheck,
};
