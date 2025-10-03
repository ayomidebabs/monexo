import { Request, Response, NextFunction } from 'express';
import Product from '../models/Product.js';
import { matchedData } from 'express-validator';
import { AppError } from '../middleware/GlobalErrorHandler.js';
import { ProductQuery } from '../types/product.js';
import { validateGetProductSuggestion } from '../inputValidation/getProductSuggestion.js';

export const getProductSuggestion = [
  ...validateGetProductSuggestion,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { search } = matchedData(req, {
        locations: ['query'],
      }) as unknown as ProductQuery;
      const query: any = {};
      console.log(search);

      if (search) query.name = { $regex: search, $options: 'i' };

      const products = await Product.find(query)
        .select('name price category createdAt images')
        .lean();

      if (!products.length) {
        return res.status(404).send({ message: 'Products not found' });
      }

      res.send(products);
    } catch (error) {
      next(new AppError((error as Error).message));
    }
  },
];
