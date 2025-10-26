import { Request, Response, NextFunction } from 'express';
import { matchedData } from 'express-validator';
import User from '../models/User.js';
import { hashPassword } from '../utils/pswdEncryption.js';
import { AppError } from '../middleware/GlobalErrorHandler.js';
import { validateUserCreation } from '../inputValidation/Auth/userCreation.js';
import TwoFa from '../models/TwoFa.js';
import { validateVerifyTwoFa } from '../inputValidation/verifyTwoFa.js';
import { getSession } from '@auth/express';
import { authConfig } from '../auth.js';

export const signUp = [
  ...validateUserCreation,
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = matchedData(req);

    try {
      let user = await User.findOne({ email });

      if (user) return res.status(400).send({ message: 'user already exists' });

      user = new User({
        name,
        email,
        local: {
          password,
        },
        strategy: 'local',
        role: 'customer',
      });
      await user.save();

      res.status(201).send({ message: 'Sign-Up successful' });
    } catch (error) {
      next(new AppError((error as Error).message));
    }
  },
];

export const notifySignInSuccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return res.send({ message: 'signIn success' });
};

export const notifySignOutSuccess = async (req: Request, res: Response) => {
  const session = await getSession(req, authConfig);
  if (!session?.user) {
    return res.send({ message: 'signOut success' });
  }
};

export const verify2FA = [
  ...validateVerifyTwoFa,
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId, code } = matchedData(req);
    try {
      const twoFA = await TwoFa.findOne({ userId, code });
      if (!twoFA || twoFA.expireAt < new Date()) {
        return res.status(401).json({ error: 'Invalid or expired 2FA code' });
      }
      await TwoFa.deleteOne({ _id: twoFA._id });
      res.status(200).json({ message: '2FA verified, access granted' });
    } catch (error) {
      console.error('2FA verification error:', error);
      next(new AppError((error as Error).message));
    }
  },
];

export const sendUser = (req: Request, res: Response) => {
  return res.send(res.locals.appUser);
};
