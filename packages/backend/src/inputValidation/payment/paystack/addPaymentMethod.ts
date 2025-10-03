import { checkSchema, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

const currentYear = new Date().getFullYear();

export const addPaymentMethodSchema = checkSchema({
  authorizationCode: {
    isString: {
      errorMessage: 'Authorization code must be a string',
    },
    notEmpty: {
      errorMessage: 'Authorization code is required',
    },
    trim: true,
    escape: true,
    isLength: {
      options: { min: 1, max: 100 },
      errorMessage: 'Authorization code must be between 1 and 100 characters',
    },
  },
  customerCode: {
    isString: {
      errorMessage: 'Customer code must be a string',
    },
    notEmpty: {
      errorMessage: 'Customer code is required',
    },
    trim: true,
    escape: true,
    isLength: {
      options: { min: 1, max: 50 },
      errorMessage: 'Customer code must be between 1 and 50 characters',
    },
  },

  email: {
    isEmail: {
      errorMessage: 'Invalid email format',
    },
    normalizeEmail: {
      options: { all_lowercase: true },
    },
    notEmpty: {
      errorMessage: 'Email is required',
    },
    trim: true,
    isLength: {
      options: { max: 255 },
      errorMessage: 'Email must not exceed 255 characters',
    },
  },

  cardType: {
    isString: {
      errorMessage: 'Card type must be a string',
    },
    notEmpty: {
      errorMessage: 'Card type is required',
    },
    trim: true,
    toLowerCase: true,
    isIn: {
      options: [
        ['visa', 'mastercard', 'amex', 'discover', 'jcb', 'diners', 'unionpay'],
      ],
      errorMessage:
        'Invalid card type; must be one of: visa, mastercard, amex, discover, jcb, diners, unionpay',
    },
  },

  last4: {
    isString: {
      errorMessage: 'Last 4 digits must be a string',
    },
    notEmpty: {
      errorMessage: 'Last 4 digits are required',
    },
    matches: {
      options: [/^\d{4}$/],
      errorMessage: 'Last 4 digits must be exactly 4 digits',
    },
  },

  expMonth: {
    isString: {
      errorMessage: 'Expiration month must be a string',
    },
    notEmpty: {
      errorMessage: 'Expiration month is required',
    },
    matches: {
      options: [/^(0[1-9]|1[0-2])$/],
      errorMessage: 'Expiration month must be between 01 and 12',
    },
  },

  expYear: {
    isString: {
      errorMessage: 'Expiration year must be a string',
    },
    notEmpty: {
      errorMessage: 'Expiration year is required',
    },
    matches: {
      options: [/^\d{4}$/],
      errorMessage: 'Expiration year must be a 4-digit number',
    },
    custom: {
      options: (value) => {
        const year = parseInt(value, 10);
        return year >= currentYear && year <= currentYear + 20;
      },
      errorMessage: `Expiration year must be between ${currentYear} and ${
        currentYear + 20
      }`,
    },
  },
});

export const validateAddPaymentMethod = [
  ...addPaymentMethodSchema,
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).send({ errors: errors.array() });
    next();
  },
];
