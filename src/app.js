
import express from 'express';
import cors from 'cors';

import usersRouter from './routes/users.js';
import ordersRouter from './routes/orders.js';
import deliveriesRouter from './routes/deliveries.js';
import mocksRouter from './routes/mocks.js';

import errorMiddleware from './middlewares/error.middleware.js';

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

// Rutas que no existen
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Ruta no encontrada'
  });
});

// Manejo centralizado de errores
app.use(errorMiddleware);

export default app;
