import winston from "winston";
import "winston-daily-rotate-file";
import { config } from "../config/config.js";

// Niveles personalizados de logging
const levels = {
  fatal: 0,
  error: 1,
  warning: 2,
  info: 3,
  http: 4,
  debug: 5
};

// Formato de los mensajes
const logFormat = winston.format.printf(
  ({ timestamp, level, message }) => {
    return `${timestamp} [${level}] ${message}`;
  }
);

// Logger centralizado
const logger = winston.createLogger({
  levels,
  level: config.nodeEnv === "production" ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    logFormat
  ),
  transports: [
    // Mostrar logs en consola
    new winston.transports.Console(),

    // Guardar errores en archivos con rotación
    new winston.transports.DailyRotateFile({
      filename: "logs/error-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      level: "error",
      maxSize: "10m",
      maxFiles: "14d"
    })
  ]
});

export default logger;