
import express from 'express';
import cors from 'cors';

import usersRouter from './routes/users.js';
import ordersRouter from './routes/orders.js';
import deliveriesRouter from './routes/deliveries.js';
import mocksRouter from './routes/mocks.js';

import errorMiddleware from './middlewares/error.middleware.js';

import AppError from './utils/errors.js';
import { ErrorDictionary } from './utils/errorDictionary.js';

import logger from './utils/logger.js';



const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas de la API
app.use('/api/users', usersRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/deliveries', deliveriesRouter);
app.use('/api/mocks', mocksRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Prueba de los niveles de Winston (solo desarrollo)
if (process.env.NODE_ENV === 'development') {
  app.get('/api/logger-test', (req, res) => {
    logger.debug('Prueba de nivel debug');
    logger.http('Prueba de nivel http');
    logger.info('Prueba de nivel info');
    logger.warning('Prueba de nivel warning');
    logger.error('Prueba de nivel error');
    logger.fatal('Prueba de nivel fatal');

    res.json({
      status: 'success',
      message: 'Prueba de logging ejecutada correctamente'
    });
  });
}

// Rutas que no existen
app.use((req, res, next) => {
  next(new AppError(ErrorDictionary.ROUTE_NOT_FOUND));
});

// Manejo centralizado de errores
app.use(errorMiddleware);

export default app;
