import { Router } from "express";
import {
  getExpenses,
  getExpense,
  createExpense,
  deleteExpense,
} from "../controllers/expenses.controller.js";

const router = Router();

router.get("/", getExpenses);
router.get("/:id", getExpense);
router.post("/", createExpense);
router.delete("/:id", deleteExpense);

export default router;