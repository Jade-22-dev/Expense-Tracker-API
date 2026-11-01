# ExpenseFlow API

A REST API for tracking personal expenses and monthly budgets. Built with Node.js, Express 5, and MySQL, using a layered architecture (routes, controllers, services, repositories).

## Features

- User registration and login with JWT authentication
- Passwords hashed with bcrypt
- Expenses: create, list, view, and delete (the date is set automatically)
- Public categories list for expense forms
- Monthly budgets: set (upsert), view, list, and delete
- Monthly summary: total spent, remaining budget, percent used, and spending per category
- Every expense and budget is scoped to the logged-in user
- Consistent JSON responses and error format
- Input validation with Zod

## Tech Stack

| Area | Tool |
|---|---|
| Runtime | Node.js 20+ (ES modules) |
| Framework | Express 5 |
| Database | MySQL 8.0.16+ (`mysql2`, connection pool) |
| Auth | `jsonwebtoken`, `bcrypt` |
| Validation | `zod` |
| Config | `dotenv` |

## Architecture

```
Request
  → Route         maps the URL and method to a controller
  → Controller    reads the request, calls a service, sends the response
  → Service       business rules (e.g. the category must exist, budget math)
  → Repository    SQL only (parameterized queries)
  → MySQL
```

Each layer has one job. Services never touch `req` or `res`, and repositories never contain business rules. Errors are thrown as `AppError` and handled in one central error handler.

```
src/
├── configs/        database pool
├── controllers/    HTTP layer
├── middlewares/    authenticate, notFound, errorHandler
├── repositories/   SQL queries
├── routes/         route definitions
├── schemas/        Zod validation schemas
├── services/       business logic
├── utils/          AppError
├── app.js          builds the Express app
└── server.js       checks config, connects to the database, starts the server
```

## Getting Started

### Prerequisites

- Node.js 20 or newer
- MySQL 8.0.16 or newer

### Setup

```bash
git clone https://github.com/USERNAME/Expense-Tracker-API.git
cd Expense-Tracker-API
npm install
cp .env.example .env
```

Create the database and tables:

```bash
mysql -u root -p < database/schema.sql
```

Generate a JWT secret and put it in `.env`:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Start the server:

```bash
npm run dev     # restarts on file changes
npm start       # production
```

The API runs at `http://localhost:3000/api/v1`.

### Environment Variables

| Variable | Description | Example |
|---|---|---|
| `PORT` | Server port | `3000` |
| `DB_HOST` | MySQL host | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_USER` | MySQL user | `root` |
| `DB_PASSWORD` | MySQL password | |
| `DB_NAME` | Database name | `expenseflow` |
| `JWT_SECRET` | Secret used to sign tokens (required) | long random string |
| `JWT_EXPIRES_IN` | Token lifetime | `1h` |

The server exits on startup if `JWT_SECRET` is missing or the database is unreachable.

## API Reference

Base URL: `/api/v1`

All endpoints require the header below, except `/auth/register`, `/auth/login`, and `/categories`:

```
Authorization: Bearer <token>
```

Successful responses are wrapped as `{ "data": ... }`. A `204` response has no body.

### Auth

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Create an account |
| POST | `/auth/login` | Get a token |
| GET | `/auth/me` | Get the current user |

**Register**

```json
POST /auth/register
{ "name": "Maria", "email": "maria@example.com", "password": "mypassword123" }
```

```json
201 Created
{ "data": { "id": 1, "name": "Maria", "email": "maria@example.com", "createdAt": "2026-11-01 10:00:00" } }
```

**Login**

```json
POST /auth/login
{ "email": "maria@example.com", "password": "mypassword123" }
```

```json
200 OK
{ "data": { "token": "eyJhbGciOiJIUzI1NiJ9..." } }
```

Validation rules: name 2 to 100 characters, a valid email, and a password of 8 to 72 characters. A wrong email and a wrong password return the same `401 INVALID_CREDENTIALS` response, so account existence is not revealed.

### Categories

| Method | Endpoint | Description |
|---|---|---|
| GET | `/categories` | List all categories (public) |

```json
200 OK
{ "data": [ { "id": 1, "name": "Food" }, { "id": 2, "name": "Transportation" } ] }
```

### Expenses

| Method | Endpoint | Description |
|---|---|---|
| GET | `/expenses` | List your expenses, newest first |
| GET | `/expenses/:id` | Get one expense |
| POST | `/expenses` | Create an expense |
| DELETE | `/expenses/:id` | Delete an expense |

```json
POST /expenses
{ "expenseName": "Coffee", "amount": 120, "categoryId": 1 }
```

```json
201 Created
{
  "data": {
    "id": 3,
    "expenseName": "Coffee",
    "amount": 120,
    "expenseDate": "2026-11-01",
    "categoryId": 1,
    "categoryName": "Food"
  }
}
```

The expense date is set to the current date by the database. `amount` must be a number greater than 0 (max 99,999,999.99). `expenseName` is 1 to 100 characters. Expenses cannot be edited: delete the expense and create a new one.

Requesting an expense that belongs to another user returns `404`, the same as a missing expense.

### Budgets

One budget per user per month. The period is part of the URL.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/budgets` | List all your budgets |
| GET | `/budgets/:year/:month` | Budget summary for a month |
| PUT | `/budgets/:year/:month` | Set or replace the budget for a month |
| DELETE | `/budgets/:year/:month` | Delete the budget for a month |

```json
PUT /budgets/2026/11
{ "budgetAmount": 15000 }
```

```json
200 OK
{ "data": { "id": 1, "year": 2026, "month": 11, "budgetAmount": 15000 } }
```

```json
GET /budgets/2026/11
200 OK
{
  "data": {
    "year": 2026,
    "month": 11,
    "budgetAmount": 15000,
    "spent": 335,
    "remaining": 14665,
    "percentUsed": 2.23,
    "isOverBudget": false,
    "byCategory": [
      { "categoryId": 3, "categoryName": "Bills", "total": 211, "percent": 62.99 },
      { "categoryId": 2, "categoryName": "Transportation", "total": 100, "percent": 29.85 },
      { "categoryId": 1, "categoryName": "Food", "total": 24, "percent": 7.16 }
    ]
  }
}
```

If no budget is set for the month, `budgetAmount`, `remaining`, and `percentUsed` are `null`, while `spent` and `byCategory` are still returned.

`PUT` is idempotent: sending the same request twice leaves one budget row with the same value.

## Errors

All errors use the same shape:

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "amount: Amount must be greater than zero" } }
```

| Status | Code | When |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Invalid request body or parameters |
| 400 | `INVALID_ID` | The id in the URL is not a positive integer |
| 400 | `INVALID_CATEGORY` | The category does not exist |
| 400 | `INVALID_JSON` | The request body is not valid JSON |
| 401 | `UNAUTHORIZED` | Missing token |
| 401 | `INVALID_TOKEN` | Malformed or tampered token |
| 401 | `TOKEN_EXPIRED` | Token has expired |
| 401 | `INVALID_CREDENTIALS` | Wrong email or password |
| 404 | `EXPENSE_NOT_FOUND` | No such expense for this user |
| 404 | `BUDGET_NOT_FOUND` | No budget for that month |
| 404 | `ROUTE_NOT_FOUND` | Unknown route |
| 409 | `EMAIL_TAKEN` | Email is already registered |
| 500 | `INTERNAL_ERROR` | Unexpected server error (details are only logged on the server) |

## Design Notes

- **Money** is stored as `DECIMAL(10, 2)`, never floating point.
- **SQL injection:** all queries use placeholders, and no user input is placed in SQL text.
- **Per-user data:** every expense and budget query includes `user_id`, so one user can never read or change another user's data.
- **Passwords** are hashed with bcrypt (12 rounds). Login compares against a dummy hash when the email is unknown, so response time does not reveal which emails exist.
- **Tokens** are signed with HS256, verified with an explicit algorithm list, and expire after `JWT_EXPIRES_IN`.
- **Monthly totals** use a date range (`>= first day` and `< first day of next month`) so the `(user_id, expense_date)` index is used.
- **Dates** are returned as plain `YYYY-MM-DD` strings to avoid timezone shifts.

## Roadmap

- Validation middleware shared by all controllers
- Rate limiting on login
- Security headers (helmet)
- Automated tests (Vitest and Supertest)
- Refresh tokens
