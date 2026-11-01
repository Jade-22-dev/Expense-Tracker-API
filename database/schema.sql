CREATE DATABASE IF NOT EXISTS expenseflow CHARACTER
SET
  utf8mb4 COLLATE utf8mb4_unicode_ci;

USE expenseflow;

CREATE TABLE
  IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

CREATE TABLE
  IF NOT EXISTS categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(50) NOT NULL UNIQUE
  );

CREATE TABLE
  IF NOT EXISTS expenses (
    expense_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    expense_name VARCHAR(100) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    expense_date DATE NOT NULL DEFAULT (CURRENT_DATE),
    CONSTRAINT fk_expenses_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
    CONSTRAINT fk_expenses_category FOREIGN KEY (category_id) REFERENCES categories (category_id),
    CONSTRAINT chk_expenses_amount CHECK (amount > 0),
    INDEX idx_expenses_user_date (user_id, expense_date)
  );

CREATE TABLE
  IF NOT EXISTS budgets (
    budget_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    budget_amount DECIMAL(10, 2) NOT NULL,
    budget_month TINYINT NOT NULL,
    budget_year SMALLINT NOT NULL,
    CONSTRAINT fk_budgets_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
    CONSTRAINT chk_budgets_amount CHECK (budget_amount > 0),
    CONSTRAINT chk_budgets_month CHECK (budget_month BETWEEN 1 AND 12),
    UNIQUE KEY uq_budget_period (user_id, budget_month, budget_year)
  );

INSERT IGNORE INTO categories (category_name)
VALUES
  ('Food'),
  ('Transportation'),
  ('Bills'),
  ('Shopping'),
  ('Entertainment'),
  ('Other');