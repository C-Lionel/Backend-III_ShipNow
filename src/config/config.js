import dotenv from "dotenv";

dotenv.config();

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

export const config = {
  port: process.env.PORT,
  mongoUri: process.env.MONGODB_URI,
  nodeEnv: process.env.NODE_ENV
};