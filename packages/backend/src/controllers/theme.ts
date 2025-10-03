import { Request, Response, NextFunction } from 'express';
import User from '../models/User.js';
import { AppError } from '../middleware/GlobalErrorHandler.js';
import { validateThemePreference } from '../inputValidation/themePreference.js';
import { matchedData } from 'express-validator';

export const getTheme = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { appUser } = res.locals;
  try {
    const user = await User.findById(appUser?.id).select('themePreference');
    if (!user) return res.status(404).send({ message: 'User not found' });
    res.send({ themePreference: user.themePreference || 'system' });
  } catch (error) {
    next(new AppError((error as Error).message));
  }
};

export const saveTheme = [
  ...validateThemePreference,
  async (req: Request, res: Response, next: NextFunction) => {
    const { themePreference } = matchedData(req);
    const { appUser } = res.locals;
    try {
      const user = await User.findById(appUser?.id);
      if (!user) return res.status(404).send({ message: 'User not found' });
      user.themePreference = themePreference;
      await user.save();
      res.status(201).send({ themePreference });
    } catch (error) {
      next(new AppError((error as Error).message));
    }
  },
];
