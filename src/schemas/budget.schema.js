import { z } from "zod";

export const periodSchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
  month: z.coerce.number().int().min(1, "Month must be 1 to 12").max(12, "Month must be 1 to 12"),
});

export const setBudgetSchema = z.object({
  budgetAmount: z
    .number()
    .positive("Budget amount must be greater than zero")
    .max(99999999.99, "Budget amount is too large"),
});