import { Request, Response, NextFunction } from 'express';
import User from '../models/User.js';
import { AppError } from '../middleware/GlobalErrorHandler.js';
import { validateAddRecentlyViewed } from '../inputValidation/recentlyViewed/addRecentlyViewed.js';
import { matchedData } from 'express-validator';
import { validateMergeRecentlyViewed } from '../inputValidation/recentlyViewed/meregeRecentlyViewed.js';

export const getRecentlyViewedProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { appUser } = res.locals;
  try {
    const user = await User.findById(appUser?.id).select(
      'recentlyViewedProducts'
    );
    if (!user) return res.status(404).send({ message: 'User not found' });
    res.send(user.recentlyViewedProducts || []);
  } catch (error) {
    next(new AppError((error as Error).message));
  }
};

export const addRecentlyViewedProduct = [
  ...validateAddRecentlyViewed,
  async (req: Request, res: Response, next: NextFunction) => {
    const { id, name, price, imageSrc, imageAlt, link } = matchedData(req);
    const { appUser } = res.locals;
    try {
      const user = await User.findById(appUser?.id).select(
        'recentlyViewedProducts'
      );
      if (!user) return res.status(404).send({ message: 'User not found' });

      let recentlyViewedProducts = user.recentlyViewedProducts || [];

      recentlyViewedProducts = recentlyViewedProducts.filter(
        (item) => item.id !== id
      );

      recentlyViewedProducts.unshift({
        id,
        name,
        price,
        imageSrc,
        imageAlt,
        link,
        viewedAt: new Date(),
      });

      if (recentlyViewedProducts.length > 10) {
        recentlyViewedProducts = recentlyViewedProducts.slice(0, 10);
      }

      user.recentlyViewedProducts = recentlyViewedProducts;
      await user.save();
      res.send(recentlyViewedProducts);
    } catch (error) {
      next(new AppError((error as Error).message));
    }
  },
];

export const mergeRecentlyViewedProducts = [
  ...validateMergeRecentlyViewed,
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      products,
    }: {
      products: {
        id: string;
        name: string;
        price: number;
        imageSrc: string;
        imageAlt: string;
        link: string;
        viewedAt: Date;
      }[];
    } = matchedData(req);
    const { appUser } = res.locals;

    try {
      const user = await User.findById(appUser?.id);
      if (!user) return res.status(404).send({ message: 'User not found' });
      let recentlyViewedProducts = user.recentlyViewedProducts || [];

      products.forEach((product) => {
        recentlyViewedProducts = recentlyViewedProducts.filter(
          (item) => item.id !== product.id
        );
        recentlyViewedProducts.unshift({ ...product, viewedAt: new Date() });
      });

      if (recentlyViewedProducts.length > 10) {
        recentlyViewedProducts = recentlyViewedProducts.slice(0, 10);
      }

      user.recentlyViewedProducts = recentlyViewedProducts;
      await user.save();
      res.send(recentlyViewedProducts);
    } catch (error) {
      next(new AppError((error as Error).message));
    }
  },
];
