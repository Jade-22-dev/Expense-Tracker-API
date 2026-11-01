import { Router } from "express";
import {
  getBudgets,
  getBudget,
  setBudget,
  deleteBudget,
} from "../controllers/budget.controller.js";

const router = Router();

router.get("/", getBudgets);
router.get("/:year/:month", getBudget);
router.put("/:year/:month", setBudget);
router.delete("/:year/:month", deleteBudget);

export default router;