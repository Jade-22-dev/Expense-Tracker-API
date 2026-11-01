import * as budgetRepo from "../repositories/budget.repository.js";
import * as expenseRepo from "../repositories/expense.repository.js";
import AppError from "../utils/AppError.js";

const round2 = (n) => Math.round(n * 100) / 100;

const budgetNotFound = () =>
  new AppError("Budget not found", 404, "BUDGET_NOT_FOUND");

export const getAllBudgets = async (userId) => {
  return budgetRepo.findAll(userId);
};

export const getBudgetSummary = async (userId, year, month) => {
  const [budget, categoryTotals] = await Promise.all([
    budgetRepo.findByPeriod(userId, year, month),
    expenseRepo.sumByCategory(userId, year, month),
  ]);

  const spent = round2(categoryTotals.reduce((sum, c) => sum + c.total, 0));

  const byCategory = categoryTotals.map((c) => ({
    ...c,
    percent: spent > 0 ? round2((c.total / spent) * 100) : 0,
  }));

  if (!budget) {
    return {
      year,
      month,
      budgetAmount: null,
      spent,
      remaining: null,
      percentUsed: null,
      isOverBudget: false,
      byCategory,
    };
  }

  return {
    year,
    month,
    budgetAmount: budget.budgetAmount,
    spent,
    remaining: round2(budget.budgetAmount - spent),
    percentUsed: round2((spent / budget.budgetAmount) * 100),
    isOverBudget: spent > budget.budgetAmount,
    byCategory,
  };
};
export const setBudget = async (userId, year, month, budgetAmount) => {
  return budgetRepo.upsert(userId, year, month, budgetAmount);
};

export const deleteBudget = async (userId, year, month) => {
  const deleted = await budgetRepo.remove(userId, year, month);

  if (!deleted) throw budgetNotFound();
};
