import { Request, Response, NextFunction } from 'express';
import User from '../models/User.js';
import { AppError } from '../middleware/GlobalErrorHandler.js';
import Subscriber from '../models/Subscriber.js';
import { validateSubscribeNewsletter } from '../inputValidation/newsletter.js';
import { matchedData } from 'express-validator';

export const subscribeNewsletter = [
  ...validateSubscribeNewsletter,
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = matchedData(req);

    try {
      const existingSubscriber = await Subscriber.findOne({ email });
      if (existingSubscriber) {
        return res.status(400).json({ message: 'Email already subscribed' });
      }
      const subscriber = new Subscriber({ email });
      await subscriber.save();
      res.send({ message: 'Subscribed successfully' });
    } catch (error) {
      next(new AppError((error as Error).message));
    }
  },
];
