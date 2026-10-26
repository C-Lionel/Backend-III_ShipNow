import AppError from "../utils/errors.js";
import { ErrorDictionary } from "../utils/errorDictionary.js";
import logger from "../utils/logger.js";

const errorMiddleware = (err, req, res, next) => {

  if (err.name === "CastError") {
    err = new AppError(ErrorDictionary.INVALID_ID);
  }

  if (err.type === "entity.parse.failed") {
    err = new AppError(ErrorDictionary.INVALID_JSON);
  }

  if (err.name === "ValidationError") {
    err = new AppError(ErrorDictionary.VALIDATION_ERROR);
  }

  const isAppError = err instanceof AppError;

  const statusCode = isAppError
    ? err.statusCode
    : ErrorDictionary.INTERNAL_SERVER_ERROR.statusCode;

  const message = isAppError
    ? err.message
    : ErrorDictionary.INTERNAL_SERVER_ERROR.message;

  const code = isAppError
    ? err.code
    : ErrorDictionary.INTERNAL_SERVER_ERROR.code;

  // Registrar el error con Winston
  if (isAppError) {
    logger.warning(`${req.method} ${req.originalUrl} - ${code}: ${message}`);
  } else {
    logger.error(
      `${req.method} ${req.originalUrl} - Error inesperado: ${err.stack || err.message}`
    );
  }

  res.status(statusCode).json({
    status: "error",
    message,
    code
  });
};

export default errorMiddleware;