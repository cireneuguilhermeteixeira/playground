const pool = require('../db/pool');
const { decrypt, encrypt, hashForLookup } = require('../security/encryption');

const USER_COLUMNS = `
  id,
  name_encrypted,
  cpf_encrypted,
  address_encrypted,
  nickname,
  created_at,
  updated_at
`;

function mapUser(row) {
  return {
    id: Number(row.id),
    name: decrypt(row.name_encrypted),
    cpf: decrypt(row.cpf_encrypted),
    address: decrypt(row.address_encrypted),
    nickname: row.nickname,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toDatabaseRecord(user) {
  return {
    nameEncrypted: encrypt(user.name),
    cpfEncrypted: encrypt(user.cpf),
    cpfHash: hashForLookup(user.cpf),
    addressEncrypted: encrypt(user.address),
    nickname: user.nickname,
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
  const record = toDatabaseRecord(user);
  const result = await pool.query(
    `INSERT INTO users (name_encrypted, cpf_encrypted, cpf_hash, address_encrypted, nickname)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING ${USER_COLUMNS}`,
    [
      record.nameEncrypted,
      record.cpfEncrypted,
      record.cpfHash,
      record.addressEncrypted,
      record.nickname,
    ],
  );

  return mapUser(result.rows[0]);
}

async function update(id, user) {
  const record = toDatabaseRecord(user);
  const result = await pool.query(
    `UPDATE users
     SET
       name_encrypted = $1,
       cpf_encrypted = $2,
       cpf_hash = $3,
       address_encrypted = $4,
       nickname = $5
     WHERE id = $6
     RETURNING ${USER_COLUMNS}`,
    [
      record.nameEncrypted,
      record.cpfEncrypted,
      record.cpfHash,
      record.addressEncrypted,
      record.nickname,
      id,
    ],
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
