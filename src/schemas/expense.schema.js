import { z } from "zod";

const expenseName = z
  .string()
  .trim()
  .min(1, "Expense name is required")
  .max(100, "Expense name must be at most 100 characters");

const amount = z
  .number()
  .positive("Amount must be greater than zero")
  .max(99999999.99, "Amount is too large");

const categoryId = z
  .number()
  .int()
  .positive("Category ID must be a positive integer");

export const createExpenseSchema = z.object({
  expenseName,
  amount,
  categoryId,
});
