import pool from "../configs/db.js";

const SELECT_EXPENSE = `
SELECT e.expense_id, e.expense_name, e.amount, e.expense_date,
         e.category_id, c.category_name
  FROM expenses e
  JOIN categories c ON c.category_id = e.category_id
`;

const toExpense = (row) => ({
  id: row.expense_id,
  expenseName: row.expense_name,
  amount: Number(row.amount),
  expenseDate: row.expense_date,
  categoryId: row.category_id,
  categoryName: row.category_name,
});

export const findAll = async (userId) => {
  const [rows] = await pool.execute(
    `${SELECT_EXPENSE}
    WHERE e.user_id = ?
    ORDER BY e.expense_date DESC, e.expense_id DESC;`,
    [userId],
  );

  return rows.map(toExpense);
};

export const findById = async (userId, id) => {
  const [rows] = await pool.execute(
    `${SELECT_EXPENSE} WHERE e.expense_id = ? AND e.user_id = ?;`,
    [id, userId],
  );
  return rows[0] ? toExpense(rows[0]) : null;
};

export const createExpense = async (
  userId,
  { expenseName, amount, categoryId },
) => {
  const [result] = await pool.execute(
    `INSERT INTO expenses (user_id, category_id, expense_name, amount)
  VALUES (?, ?, ?, ?)`,
    [userId, categoryId, expenseName, amount],
  );
  return findById(userId, result.insertId);
};

export const deleteExpense = async (userId, id) => {
  const [result] = await pool.execute(
    "DELETE FROM expenses WHERE user_id = ? AND expense_id = ?",
    [userId, id],
  );

  return result.affectedRows > 0;
};

const pad = (n) => String(n).padStart(2, "0");

const monthRange = (year, month) => ({
  start: `${year}-${pad(month)}-01`,
  next: month === 12 ? `${year + 1}-01-01` : `${year}-${pad(month + 1)}-01`,
});

export const sumByCategory = async (userId, year, month) => {
  const { start, next } = monthRange(year, month);

  const [rows] = await pool.execute(
    `SELECT c.category_id, c.category_name, SUM(e.amount) AS total
     FROM expenses e
     JOIN categories c ON c.category_id = e.category_id
     WHERE e.user_id = ? AND e.expense_date >= ? AND e.expense_date < ?
     GROUP BY c.category_id, c.category_name
     ORDER BY total DESC`,
    [userId, start, next],
  );

  return rows.map((row) => ({
    categoryId: row.category_id,
    categoryName: row.category_name,
    total: Number(row.total),
  }));
};
