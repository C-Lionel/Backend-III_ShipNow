import mongoose from "mongoose";
import app from "./app.js";
import { config } from "./config/config.js";
import logger from "./utils/logger.js";

const PORT = config.port;

mongoose.connect(config.mongoUri)
  .then(() => {
    logger.info("Conexión a MongoDB establecida");

    app.listen(PORT, () => {
      logger.info(`Servidor ShipNow escuchando en el puerto ${PORT}`);
    });
  })
  .catch((error) => {
    logger.fatal(`No se pudo conectar a MongoDB: ${error.message}`);
    process.exitCode = 1;
  });