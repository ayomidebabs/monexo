import { checkSchema, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

const subscribeNewsletterSchema = checkSchema({
  email: {
    normalizeEmail: true,
    notEmpty: {
      errorMessage: 'Email is required',
    },
    isEmail: {
      errorMessage: 'Enter a valid email',
    },
  },
});

export const validateSubscribeNewsletter = [
  ...subscribeNewsletterSchema,
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).send({ errors: errors.array() });
    next();
  },
];
