import { checkSchema, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const referenceValidationSchema = checkSchema(
  {
    reference: {
      isString: {
        errorMessage: 'Reference must be a string',
      },
      notEmpty: {
        errorMessage: 'Reference is required',
      },
      trim: true,
      escape: true,
      isLength: {
        options: { min: 1, max: 100 },
        errorMessage: 'Reference must be between 1 and 100 characters',
      },
    },
  },
  ['params']
);

export const validateReference = [
  ...referenceValidationSchema,
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).send({ errors: errors.array() });
    next();
  },
];
