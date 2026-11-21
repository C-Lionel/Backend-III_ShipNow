
import dotenv from "dotenv";

const isTest = process.env.NODE_ENV === "test";

// En desarrollo y producción cargamos las variables desde .env.
// En testing no necesitamos credenciales externas.
if (!isTest) {
  dotenv.config({ path: ".env" });
}

// Variables obligatorias para ejecutar la aplicación.
// Durante testing MongoDB se inicia en memoria.
if (!isTest) {
  const requiredEnv = [
    "PORT",
    "MONGODB_URI",
    "NODE_ENV"
  ];

  requiredEnv.forEach((envVar) => {
    if (!process.env[envVar]) {
      throw new Error(
        `Falta configurar la variable: ${envVar}`
      );
    }
  });
}

export const config = {
  port: isTest ? 8081 : process.env.PORT,
  mongoUri: isTest ? null : process.env.MONGODB_URI,
  nodeEnv: process.env.NODE_ENV
};
