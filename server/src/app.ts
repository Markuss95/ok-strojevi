import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import authRoutes from './routes/auth';
import machineRoutes from './routes/machines';
import siteRoutes from './routes/sites';
import { notFound, errorHandler } from './middleware/error';

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.clientOrigins,
      credentials: true,
    })
  );
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', env: env.nodeEnv });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/machines', machineRoutes);
  app.use('/api/sites', siteRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
