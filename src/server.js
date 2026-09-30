import mongoose from 'mongoose';
import app from './app.js';
import { config } from './config/config.js';

const PORT = config.port;

mongoose.connect(config.mongoUri)
  .then(() => {
    app.listen(PORT, () => {
      console.log('Servidor corriendo en puerto ' + PORT);
    });
  })
  .catch((error) => {
    console.log('Error de conexión', error);
  });