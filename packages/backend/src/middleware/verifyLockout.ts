import dotenv from 'dotenv';
dotenv.config();
import { matchedData } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import Lockout from '../models/Lockout.js';
import { AppError } from './GlobalErrorHandler.js';
interface AuthRequest extends Request {
  lockoutKey: string;
  lockoutDuration: number;
  maxAttempts: number;
}

export const verifyLockout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email } = matchedData(req);
  const ip = req.ip;
  const key = `${ip}-${email || 'unknown'}`;
  const maxAttempts = parseInt(process.env.LOCKOUT_ATTEMPTS as string);
  const lockoutDuration = parseInt(process.env.LOCKOUT_DURATION as string);

  try {
    const lockout = await Lockout.findOne({ key });
    if (lockout && lockout.lockedUntil && lockout.lockedUntil > new Date()) {
      const retryAfter = Math.ceil(
        (Number(lockout.lockedUntil) - Date.now()) / 3600000
      );
      throw new Error(`Account locked for ${retryAfter} hour`);
    }
  } catch (error) {
    return next(new AppError((error as Error).message, 423));
  }

  (req as AuthRequest).lockoutKey = key;
  (req as AuthRequest).lockoutDuration = lockoutDuration;
  (req as AuthRequest).maxAttempts = maxAttempts;
  next();
};
