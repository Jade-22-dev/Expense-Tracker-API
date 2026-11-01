import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as userRepo from "../repositories/user.repository.js";
import AppError from "../utils/AppError.js";

const SALT_ROUNDS = 12;
const DUMMY_HASH = bcrypt.hashSync("dummy-password", SALT_ROUNDS);

const signToken = (userId) =>
  jwt.sign({}, process.env.JWT_SECRET, {
    algorithm: "HS256",
    subject: String(userId),
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
  });

export const register = async ({ name, email, password }) => {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await userRepo.create({ name, email, passwordHash });

  if (!user) throw new AppError("Email is already taken", 409, "EMAIL_TAKEN");

  return user;
};

export const login = async ({ email, password }) => {
  const credentials = await userRepo.findEmailCredentials(email);

  const isMatch = await bcrypt.compare(
    password,
    credentials?.passwordHash ?? DUMMY_HASH,
  );

  if (!credentials || !isMatch)
    throw new AppError("Invalid Email or Password", 401, "INVALID_CREDENTIALS");

  return { token: signToken(credentials.id) };
};

export const getCurrentuser = async (userId) => {
  const user = await userRepo.findById(userId);

  if (!user)
    throw new AppError("Authentication is required", 401, "UNAUTHORIZED");

  return user;
};
