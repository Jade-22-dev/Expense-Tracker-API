import jwt from "jsonwebtoken";
import AppError from "../utils/AppError.js";

const authenticate = async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer "))
    throw new AppError("Authentication is required", 401, "UNAUTHORIZED");

  const token = header.slice(7);
  let payload;

  try {
    payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });
  } catch (error) {
    if (error.name === "TokenExpiredError")
      throw new AppError("Token has expired", 401, "TOKEN_EXPIRED");

    throw new AppError("Invalid Token", 401, "INVALID_TOKEN");
  }

  req.user = { id: Number(payload.sub) };

  next();
};

export default authenticate;
