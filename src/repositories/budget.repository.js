import pool from "../configs/db.js";

const SELECT_BUDGET = `
  SELECT budget_id, budget_year, budget_month, budget_amount
  FROM budgets
`;

const toBudget = (row) => ({
  id: row.budget_id,
  year: row.budget_year,
  month: row.budget_month,
  budgetAmount: Number(row.budget_amount),
});

export const findAll = async (userId) => {
  const [rows] = await pool.execute(
    `${SELECT_BUDGET} WHERE user_id = ?
     ORDER BY budget_year DESC, budget_month DESC`,
    [userId],
  );

  return rows.map(toBudget);
};

export const findByPeriod = async (userId, year, month) => {
  const [rows] = await pool.execute(
    `${SELECT_BUDGET}
     WHERE user_id = ? AND budget_year = ? AND budget_month = ?`,
    [userId, year, month],
  );

  return rows[0] ? toBudget(rows[0]) : null;
};

export const upsert = async (userId, year, month, budgetAmount) => {
  await pool.execute(
    `INSERT INTO budgets (user_id, budget_year, budget_month, budget_amount)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE budget_amount = VALUES(budget_amount)`,
    [userId, year, month, budgetAmount],
  );

  return findByPeriod(userId, year, month);
};

export const remove = async (userId, year, month) => {
  const [result] = await pool.execute(
    `DELETE FROM budgets
     WHERE user_id = ? AND budget_year = ? AND budget_month = ?`,
    [userId, year, month],
  );

  return result.affectedRows > 0;
};
