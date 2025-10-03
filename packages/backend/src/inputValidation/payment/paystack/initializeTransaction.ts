import { checkSchema, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

const supportedCurrencies = ['NGN', 'GHS', 'ZAR'];

const initializeTransactionSchema = checkSchema({
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

  currency: {
    isString: {
      errorMessage: 'Currency must be a string',
    },
    notEmpty: {
      errorMessage: 'Currency is required',
    },
    trim: true,
    isLength: {
      options: { min: 3, max: 3 },
      errorMessage: 'Currency must be a 3-letter code',
    },
    isIn: {
      options: [supportedCurrencies],
      errorMessage: `Currency must be one of: ${supportedCurrencies.join(
        ', '
      )}`,
    },
  },
});

export const validateInitializeTransaction = [
  ...initializeTransactionSchema,
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).send({ errors: errors.array() });
    next();
  },
];
