const userRepository = require('../repositories/userRepository');

function validateUserPayload(body) {
  const requiredFields = ['name', 'cpf', 'address', 'nickname'];
  const missingFields = requiredFields.filter((field) => !body[field] || String(body[field]).trim() === '');

  if (missingFields.length > 0) {
    return `Missing required fields: ${missingFields.join(', ')}`;
  }

  return null;
}

function normalizeUserPayload(body) {
  return {
    name: String(body.name).trim(),
    cpf: String(body.cpf).trim(),
    address: String(body.address).trim(),
    nickname: String(body.nickname).trim(),
  };
}

async function listUsers(req, res, next) {
  try {
    const users = await userRepository.findAll();
    res.json(users);
  } catch (error) {
    next(error);
  }
}

async function getUser(req, res, next) {
  try {
    const user = await userRepository.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json(user);
  } catch (error) {
    return next(error);
  }
}

async function createUser(req, res, next) {
  try {
    const validationError = validateUserPayload(req.body);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const user = await userRepository.create(normalizeUserPayload(req.body));
    return res.status(201).json(user);
  } catch (error) {
    return next(error);
  }
}

async function updateUser(req, res, next) {
  try {
    const validationError = validateUserPayload(req.body);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const user = await userRepository.update(req.params.id, normalizeUserPayload(req.body));

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json(user);
  } catch (error) {
    return next(error);
  }
}

async function deleteUser(req, res, next) {
  try {
    const deleted = await userRepository.remove(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
};
