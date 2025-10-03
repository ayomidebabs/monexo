import { checkSchema, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

const addToWishlistSchema = checkSchema({
  pId: {
    isMongoId: {
      errorMessage: 'A valid product ID is required',
    },
  },
});

export const validateAddToWishlist = [
  ...addToWishlistSchema,
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).send({ errors: errors.array() });
    next();
  },
];
