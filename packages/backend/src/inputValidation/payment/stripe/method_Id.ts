import { checkSchema, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

const methodIdSchema = checkSchema({
  paymentMethodId: {
    in: ['body'],
    isString: {
      errorMessage: 'Payment method ID must be a string',
    },
    notEmpty: {
      errorMessage: 'Payment method ID is required',
    },
  },
});

const _methodIdSchema = checkSchema({
  paymentMethodId: {
    in: ['params'],
    isString: {
      errorMessage: 'Payment method ID must be a string',
    },
    notEmpty: {
      errorMessage: 'Payment method ID is required',
    },
  },
});

export const validateMethodId = [
  ...methodIdSchema,
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).send({ errors: errors.array() });
    next();
  },
];

export const validateMethodIdParam = [
  ..._methodIdSchema,
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).send({ errors: errors.array() });
    next();
  },
];
