import * as expenseService from "../services/expense.service.js";
import { createExpenseSchema } from "../schemas/expense.schema.js";
import AppError from "../utils/AppError.js";

const parseId = (value) => {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0)
    throw new AppError(
      "ID must be an integer greater than zero",
      400,
      "INVALID_ID",
    );

  return id;
};

const parseBody = (schema, body) => {
  const result = schema.safeParse(body);

  if (!result.success) {
    const message = result.error.issues
      .map((issue) => `${issue.path.join(".") || "body"}: ${issue.message}`)
      .join(", ");
    throw new AppError(message, 400, "VALIDATION_ERROR");
  }

  return result.data;
};

export const getExpenses = async (req, res) => {
  const expenses = await expenseService.getAllExpenses(req.user.id);
  res.status(200).json({ data: expenses });
};

export const getExpense = async (req, res) => {
  const id = parseId(req.params.id);
  const expense = await expenseService.getExpensesById(req.user.id, id);
  res.status(200).json({ data: expense });
};

export const createExpense = async (req, res) => {
  const data = parseBody(createExpenseSchema, req.body);
  const expense = await expenseService.createExpense(req.user.id, data);
  res.status(201).json({ data: expense });
};

export const deleteExpense = async (req, res) => {
  const id = parseId(req.params.id);
  await expenseService.deleteExpense(req.user.id, id);
  res.status(204).send();
};
