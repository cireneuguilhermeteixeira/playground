const pool = require('../db/pool');

const USER_COLUMNS = 'id, name, cpf, address, nickname, created_at, updated_at';

function mapUser(row) {
  return {
    id: Number(row.id),
    name: row.name,
    cpf: row.cpf,
    address: row.address,
    nickname: row.nickname,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function findAll() {
  const result = await pool.query(`SELECT ${USER_COLUMNS} FROM users ORDER BY id`);
  return result.rows.map(mapUser);
}

async function findById(id) {
  const result = await pool.query(`SELECT ${USER_COLUMNS} FROM users WHERE id = $1`, [id]);
  return result.rows[0] ? mapUser(result.rows[0]) : null;
}

async function create(user) {
  const result = await pool.query(
    `INSERT INTO users (name, cpf, address, nickname)
     VALUES ($1, $2, $3, $4)
     RETURNING ${USER_COLUMNS}`,
    [user.name, user.cpf, user.address, user.nickname],
  );

  return mapUser(result.rows[0]);
}

async function update(id, user) {
  const result = await pool.query(
    `UPDATE users
     SET name = $1, cpf = $2, address = $3, nickname = $4
     WHERE id = $5
     RETURNING ${USER_COLUMNS}`,
    [user.name, user.cpf, user.address, user.nickname, id],
  );

  return result.rows[0] ? mapUser(result.rows[0]) : null;
}

async function remove(id) {
  const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
  return result.rowCount > 0;
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
};
