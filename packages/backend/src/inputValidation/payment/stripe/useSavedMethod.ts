import { checkSchema, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

const useSavedMethodSchema = checkSchema({
  products: {
    isArray: {
      errorMessage: 'Products must be an array',
    },
    notEmpty: {
      errorMessage: 'Products array is required',
    },
  },
  'products.*.pId': {
    isMongoId: {
      errorMessage: 'A valid product ID is required',
    },
    notEmpty: {
      errorMessage: 'Product ID is required',
    },
  },
  'products.*.quantity': {
    toInt: true,
    isInt: {
      options: {
        min: 1,
      },
      errorMessage: 'Quantity must be a positive integer',
    },
  },

  email: {
    normalizeEmail: true,
    notEmpty: {
      errorMessage: 'Email is required',
    },
    isEmail: {
      errorMessage: 'Enter a valid email',
    },
  },

  paymentMethodId: {
    isString: {
      errorMessage: 'Payment method ID must be a string',
    },
  },
});

export const validateUseSavedmethod = [
  ...useSavedMethodSchema,
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).send({ errors: errors.array() });
    next();
  },
];
