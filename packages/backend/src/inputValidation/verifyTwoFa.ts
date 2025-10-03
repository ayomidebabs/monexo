import { checkSchema, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

const verifyTwoFaSchema = checkSchema({
  userId: {
    isMongoId: {
      errorMessage: 'Invalid user ID',
    },
    notEmpty: {
      errorMessage: 'Product ID is required',
    },
  },

  code: {
    trim: true,
    escape: true,
    notEmpty: {
      errorMessage: 'Code is required',
    },
    isString: {
      errorMessage: 'Code must be a string',
    },
  },
});

export const validateVerifyTwoFa = [
  ...verifyTwoFaSchema,
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).send({ errors: errors.array() });
    next();
  },
];
