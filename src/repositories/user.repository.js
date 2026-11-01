import pool from "../configs/db.js";

const toUser = (row) => ({
  id: row.user_id,
  name: row.name,
  email: row.email,
  createdAt: row.created_at,
});

export const findById = async (userId) => {
  const [rows] = await pool.execute(
    "SELECT user_id, name, email, created_at FROM users WHERE user_id = ?",
    [userId],
  );

  return rows[0] ? toUser(rows[0]) : null;
};

export const findEmailCredentials = async (email) => {
  const [result] = await pool.execute(
    "SELECT user_id, password_hash FROM users WHERE email = ?",
    [email],
  );

  return result[0]
    ? { id: result[0].user_id, passwordHash: result[0].password_hash }
    : null;
};

export const create = async ({ name, email, passwordHash }) => {
  try {
    const [result] = await pool.execute(
      "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
      [name, email, passwordHash],
    );

    return findById(result.insertId);
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") return null;
    throw error;
  }
};
