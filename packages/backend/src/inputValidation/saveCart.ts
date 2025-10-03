import { checkSchema, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

const saveCartSchema = checkSchema({
  cart: {
    isArray: {
      errorMessage: 'cart must be an must be an Array',
    },
  },

  'cart.*': {
    optional: true,
  },

  'cart.*.pId': {
    isMongoId: {
      errorMessage: 'A valid product ID is required',
    },
    notEmpty: {
      errorMessage: 'Product ID is required',
    },
  },

  'cart.*.name': {
    isString: {
      errorMessage: 'Name must be a string',
    },
    notEmpty: {
      errorMessage: 'Name is required',
    },
  },

  'cart.*.quantity': {
    toInt: true,
    isInt: {
      options: {
        min: 1,
      },
      errorMessage: 'Quantity must be a positive integer',
    },
  },

  'cart.*.price': {
    toFloat: true,
    isFloat: {
      options: { min: 0 },
      errorMessage: 'Price must be a positive number',
    },
  },

  'cart.*.imageSrc': {
    isString: {
      errorMessage: 'Image source must be a string',
    },
  },

  'cart.*.imageAlt': {
    isString: {
      errorMessage: 'Image description must be a string',
    },
  },
});

export const validateSaveCart = [
  ...saveCartSchema,
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).send({ errors: errors.array() });
    next();
  },
];
