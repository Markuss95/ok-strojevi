import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/token';
import { Role } from '../models/User';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: { userId: string; role: Role };
    }
  }
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Potrebna je prijava' });
    return;
  }
  try {
    const payload = verifyToken(header.slice(7));
    req.auth = { userId: payload.sub, role: payload.role };
    next();
  } catch {
    res.status(401).json({ error: 'Neispravan ili istekao token' });
  }
}

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.auth) {
      res.status(401).json({ error: 'Potrebna je prijava' });
      return;
    }
    if (!roles.includes(req.auth.role)) {
      res.status(403).json({ error: 'Nemate dovoljno ovlasti' });
      return;
    }
    next();
  };
}
