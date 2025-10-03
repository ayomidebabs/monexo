import { checkSchema, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

const addRecentlyViewedSchema = checkSchema({
  id: {
    isString: {
      errorMessage: 'Id must be a string',
    },
  },
  name: {
    isString: {
      errorMessage: 'Id must be a string',
    },
  },
  price: {
    isFloat: {
      options: { min: 0 },
      errorMessage: 'Price must be a positive number',
    },
  },

  imageSrc: {
    isString: {
      errorMessage: 'Image source must be a string',
    },
  },

  imageAlt: {
    isString: {
      errorMessage: 'Image description must be a string',
    },
  },

  link: {
    isString: {
      errorMessage: 'Link must be a string',
    },
  },
});

export const validateAddRecentlyViewed = [
  ...addRecentlyViewedSchema,
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).send({ errors: errors.array() });
    next();
  },
];
