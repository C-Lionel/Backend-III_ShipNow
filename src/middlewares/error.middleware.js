
const errorMiddleware = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Error interno del servidor";

  // Errores de validación de Mongoose
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = err.message;
  }

  // IDs inválidos u otros errores de conversión
  if (err.name === "CastError") {
    statusCode = 400;
    message = "El identificador o valor proporcionado no es válido";
  }

  res.status(statusCode).json({
    status: "error",
    message
  });
};

export default errorMiddleware;
