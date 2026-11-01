import "dotenv/config";
import express from "express";
import expensesRouter from "./routes/expense.routes.js";
import notFound from "./middlewares/notFound.js";
import errorHandler from "./middlewares/errorHandler.js";
import authenticate from "./middlewares/authenticate.js";
import authRoute from "./routes/auth.routes.js";
import budgetsRouter from "./routes/budget.routes.js";
import categoriesRouter from "./routes/categories.routes.js";

const app = express();

app.use(express.json());
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/expenses", authenticate, expensesRouter);
app.use("/api/v1/budgets", authenticate, budgetsRouter);
app.use("/api/v1/categories", categoriesRouter)
app.use(notFound);
app.use(errorHandler);

export default app;
