import { checkSchema, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

const mergeRecentlyViewedSchema = checkSchema({
  products: {
    isArray: {
      errorMessage: 'Products must be an array',
    },
  },

  'products.*.id': {
    isString: {
      errorMessage: 'Link must be a string',
    },
  },

  'products.*.name': {
    isString: {
      errorMessage: 'Id must be a string',
    },
  },
  'products.*.price': {
    isFloat: {
      options: { min: 0 },
      errorMessage: 'Price must be a positive number',
    },
  },

  'products.*.imageSrc': {
    isString: {
      errorMessage: 'Image source must be a string',
    },
  },

  'products.*.imageAlt': {
    isString: {
      errorMessage: 'Image description must be a string',
    },
  },

  'products.*.link': {
    isString: {
      errorMessage: 'Link must be a string',
    },
  },
});

export const validateMergeRecentlyViewed = [
  ...mergeRecentlyViewedSchema,
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).send({ errors: errors.array() });
    next();
  },
];
