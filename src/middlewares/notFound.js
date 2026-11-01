import AppError from "../utils/AppError.js";

const notFound = (req, res, next) => {
  next(
    new AppError(
      `Cannot ${req.method} ${req.originalUrl}`,
      404,
      "ROUTE_NOT_FOUND",
    ),
  );
};

export default notFound;
