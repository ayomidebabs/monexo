import { NextFunction, Request, Response } from 'express';
import Category from '../models/Category.js';
import { AppError } from '../middleware/GlobalErrorHandler.js';
import User from '../models/User.js';
import { validateSaveCart } from '../inputValidation/saveCart.js';
import { matchedData } from 'express-validator';

export const getCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { appUser } = res.locals;
  try {
    const user = await User.findById(appUser?.id).select('cart -_id');
    if (!user) return res.status(404).send({ message: 'user cart not found' });
    res.send(user.cart);
  } catch (error) {
    next(new AppError((error as Error).message));
  }
};

export const saveCart = [
  ...validateSaveCart,
  async (req: Request, res: Response, next: NextFunction) => {
    const { appUser } = res.locals;
    try {
      const { cart } = matchedData(req);
      let user = await User.findById(appUser?.id);
      if (!user) return res.status(404).send({ message: 'User not found' });
      user.cart = cart;
      await user.save();
      res.status(201).send({ message: 'Cart saved successfully' });
    } catch (error) {
      next(new AppError((error as Error).message));
    }
  },
];
