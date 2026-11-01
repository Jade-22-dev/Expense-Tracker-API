import pool from "../configs/db.js";

const toCategory = (cate) => ({
  id: cate.category_id,
  name: cate.category_name,
});

export const findAll = async () => {
  const [rows] = await pool.execute(
    "SELECT category_id, category_name FROM categories ORDER BY category_id",
  );
  return rows.map(toCategory)
};

export const findById = async (id) => {
  const [rows] = await pool.execute(
    "SELECT category_id, category_name FROM categories WHERE category_id = ?",
    [id],
  );

  return rows[0] ? toCategory(rows[0]) : null;
};
