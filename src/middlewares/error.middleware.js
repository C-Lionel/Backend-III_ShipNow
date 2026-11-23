
import multer from "multer";

import AppError from "../utils/errors.js";
import { ErrorDictionary } from "../utils/errorDictionary.js";
import logger from "../utils/logger.js";

const errorMiddleware = (err, req, res, next) => {

  // Errores específicos de Multer
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      err = new AppError(ErrorDictionary.FILE_TOO_LARGE);
    } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
      err = new AppError(ErrorDictionary.INVALID_FILE_FIELD);
    } else {
      err = new AppError(ErrorDictionary.FILE_UPLOAD_ERROR);
    }
  }

  // Errores de MongoDB
  if (err.name === "CastError") {
    err = new AppError(ErrorDictionary.INVALID_ID);
  }

  // JSON inválido
  if (err.type === "entity.parse.failed") {
    err = new AppError(ErrorDictionary.INVALID_JSON);
  }

  // Errores de validación de Mongoose
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
    logger.warning(
      `${req.method} ${req.originalUrl} - ${code}: ${message}`
    );
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
