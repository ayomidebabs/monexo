import { Request, Response, NextFunction } from 'express';
import { getSession } from '@auth/express';
import { authConfig } from '../auth.js';

export default async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const session = await getSession(req, authConfig);
  if (!session?.user) {
    return res.status(401).send({ message: "You aren't authenticated" });
  }
  res.locals.appUser = session.user;
  next();
}
