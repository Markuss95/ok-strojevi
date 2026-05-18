import { Request, Response, NextFunction, RequestHandler } from 'express';

// Express 4 does not catch rejected promises from async handlers,
// so wrap them to forward errors to the error middleware.
export function asyncHandler(fn: RequestHandler): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
