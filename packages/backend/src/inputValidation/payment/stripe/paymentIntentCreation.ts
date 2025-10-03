import { checkSchema, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

const paymentIntentCreationSchema = checkSchema({
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

  savePayment: {
    optional: true,
    isBoolean: {
      errorMessage: 'Save payment can only be true or false',
    },
  },
});

export const validatePaymentIntentCreation = [
  ...paymentIntentCreationSchema,
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).send({ errors: errors.array() });
    next();
  },
];
