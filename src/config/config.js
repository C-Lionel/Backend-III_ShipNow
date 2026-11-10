
import dotenv from "dotenv";

const isTest = process.env.NODE_ENV === "test";

dotenv.config({
  path: isTest ? ".env.test" : ".env",
  override: isTest
});

const requiredEnv = [
  "PORT",
  "MONGODB_URI",
  "NODE_ENV"
];

requiredEnv.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Falta configurar la variable: ${envVar}`);
  }
});

if (process.env.NODE_ENV === "test") {
  const databaseName = new URL(process.env.MONGODB_URI).pathname.slice(1);

  if (databaseName !== "shipnow_test") {
    throw new Error(
      "SEGURIDAD: Los tests solo pueden utilizar la base shipnow_test"
    );
  }
}

export const config = {
  port: process.env.PORT,
  mongoUri: process.env.MONGODB_URI,
  nodeEnv: process.env.NODE_ENV
};
