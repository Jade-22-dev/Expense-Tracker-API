import { registerSchema, loginSchema } from "../schemas/auth.schema.js";
import * as authService from "../services/auth.service.js";
import AppError from "../utils/AppError.js";

const safeParse = (schema, body) => {
  const result = schema.safeParse(body);

  if (!result.success) {
    const message = result.error.issues
      .map((issue) => `${issue.path.join(".") || "body"}: ${issue.message}`)
      .join(", ");
    throw new AppError(message, 400, "VALIDATION_ERROR");
  }

  return result.data;
};

export const register = async (req, res) => {
  const data = safeParse(registerSchema, req.body);
  const result = await authService.register(data);

  res.status(201).json({ data: result });
};

export const login = async (req, res) => {
  const data = safeParse(loginSchema, req.body);
  const result = await authService.login(data);

  res.status(200).json({ data: result });
};

export const me = async (req, res) => {
  const user = await authService.getCurrentuser(req.user.id);

  res.status(200).json({ data: user });
};
