import { Request, Response, NextFunction } from 'express'

export function asyncMiddleware (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err: unknown) => next(err))
  }
}
