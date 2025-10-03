import { checkSchema, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const getProductSuggestionSchema = checkSchema(
  {
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
  },
  ['query']
);

export const validateGetProductSuggestion = [
  ...getProductSuggestionSchema,
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).send({ errors: errors.array() });
    next();
  },
];
