import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

export function notFound(_req: Request, res: Response): void {
  res.status(404).json({ error: 'Not found' });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  console.error('[error]', err);
  const message =
    err instanceof Error ? err.message : 'Internal server error';
  res.status(500).json({
    error: env.nodeEnv === 'production' ? 'Internal server error' : message,
  });
}
