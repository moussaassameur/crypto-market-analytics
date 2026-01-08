const db = require("../db/pool");

const findByEmail = async (email) => {
  const r = await db.query(
    "SELECT id, email, name, password_hash, role, created_at FROM users WHERE email = $1",
    [email.toLowerCase()]
  );
  return r.rows[0] || null;
};

const findById = async (id) => {
  const r = await db.query(
    "SELECT id, email, name, role, created_at FROM users WHERE id = $1",
    [id]
  );
  return r.rows[0] || null;
};

const createUser = async (email, passwordHash, name) => {
  const r = await db.query(
    "INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, 'user') RETURNING id, email, name, role, created_at",
    [email.toLowerCase(), passwordHash, name]
  );
  return r.rows[0];
};

module.exports = { findByEmail, findById, createUser };
