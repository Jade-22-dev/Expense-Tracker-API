import * as categoryRepo from "../repositories/categories.repository.js";
import * as expenseRepo from "../repositories/expense.repository.js";
import AppError from "../utils/AppError.js";

const expenseNotFound = () =>
  new AppError("Expense not found", 404, "EXPENSE_NOT_FOUND");

const checkCategoryExists = async (categoryId) => {
  const category = await categoryRepo.findById(categoryId);

  if (!category) {
    throw new AppError("Category does not exist", 400, "INVALID_CATEGORY");
  }
};

export const getAllExpenses = async (userId) => {
  return expenseRepo.findAll(userId);
};

export const getExpensesById = async (userId, id) => {
  const expense = await expenseRepo.findById(userId, id);

  if (!expense) throw expenseNotFound();

  return expense;
};

export const createExpense = async (userId, data) => {
  await checkCategoryExists(data.categoryId);
  return expenseRepo.createExpense(userId, data);
};

export const deleteExpense = async (userId, id) => {
  const deleted = await expenseRepo.deleteExpense(userId, id);

  if (!deleted) throw expenseNotFound();
};