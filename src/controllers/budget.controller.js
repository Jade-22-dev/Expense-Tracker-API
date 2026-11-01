import * as budgetService from "../services/budget.service.js";
import { periodSchema, setBudgetSchema } from "../schemas/budget.schema.js";
import AppError from "../utils/AppError.js";

const parse = (schema, data) => {
  const result = schema.safeParse(data);

  if (!result.success) {
    const message = result.error.issues
      .map((issue) => `${issue.path.join(".") || "body"}: ${issue.message}`)
      .join(", ");
    throw new AppError(message, 400, "VALIDATION_ERROR");
  }

  return result.data;
};

export const getBudgets = async (req, res) => {
  const budgets = await budgetService.getAllBudgets(req.user.id);
  res.status(200).json({ data: budgets });
};

export const getBudget = async (req, res) => {
  const { year, month } = parse(periodSchema, req.params);
  const summary = await budgetService.getBudgetSummary(
    req.user.id,
    year,
    month,
  );
  res.status(200).json({ data: summary });
};

export const setBudget = async (req, res) => {
  const { year, month } = parse(periodSchema, req.params);
  const { budgetAmount } = parse(setBudgetSchema, req.body);
  const budget = await budgetService.setBudget(
    req.user.id,
    year,
    month,
    budgetAmount,
  );
  res.status(200).json({ data: budget });
};

export const deleteBudget = async (req, res) => {
  const { year, month } = parse(periodSchema, req.params);
  await budgetService.deleteBudget(req.user.id, year, month);
  res.status(204).send();
};