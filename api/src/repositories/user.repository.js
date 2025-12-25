const db = require("../db/pool");

const findByEmail = async (email) => {
  const r = await db.query(
    "SELECT id, email, password_hash, role, created_at FROM users WHERE email = $1",
    [email.toLowerCase()]
  );
  return r.rows[0] || null;
};

const findById = async (id) => {
  const r = await db.query(
    "SELECT id, email, role, created_at FROM users WHERE id = $1",
    [id]
  );
  return r.rows[0] || null;
};

const createUser = async (email, passwordHash) => {
  const r = await db.query(
    "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, 'user') RETURNING id, email, role, created_at",
    [email.toLowerCase(), passwordHash]
  );
  return r.rows[0];
};

module.exports = { findByEmail, findById, createUser };
