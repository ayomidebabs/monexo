import { checkSchema, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const getProductSchema = checkSchema(
  {
    page: {
      optional: true,
      toInt: true,
      isInt: {
        options: { min: 1 },
        errorMessage: 'Page must be a positive integer',
      },
    },
    limit: {
      optional: true,
      toInt: true,
      isInt: {
        options: { min: 1, max: 100 },
        errorMessage: 'Limit must be a positive integer between 1 and 100',
      },
    },
    category: {
      optional: true,
      trim: true,
      escape: true,
      isString: {
        errorMessage: 'Category must be a string',
      },
      isLength: {
        options: { min: 1, max: 50 },
        errorMessage: 'Category must be a string between 1 and 50 characters',
      },
      matches: {
        options: /^[a-zA-Z0-9\s-]+$/,
        errorMessage: 'Category contains invalid characters',
      },
    },
    search: {
      optional: true,
      trim: true,
      escape: true,
      isString: {
        errorMessage: 'Search term must be a string',
      },
      isLength: {
        options: { min: 1, max: 100 },
        errorMessage:
          'Search term must be a string between 1 and 100 characters',
      },
      matches: {
        options: /^[a-zA-Z0-9\s-]+$/,
        errorMessage: 'Search term contains invalid characters',
      },
    },
    sortBy: {
      optional: true,
      isIn: {
        options: [['name', 'price', 'createdAt', 'updatedAt']],
        errorMessage:
          'sortBy must be one of: name, price, createdAt or updatedAt',
      },
    },
    sortOrder: {
      optional: true,
      isIn: {
        options: [['asc', 'desc']],
        errorMessage: 'sortOrder must be either "asc" or "desc"',
      },
    },
  },
  ['query']
);

export const validateGetProduct = [
  ...getProductSchema,
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).send({ errors: errors.array() });
    next();
  },
];
