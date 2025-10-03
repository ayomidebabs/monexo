import { NextFunction, Request, Response } from 'express';
import Product from '../models/Product.js';
import { validatePid } from '../inputValidation/pId.js';
import { validateReviewCreation } from '../inputValidation/reviewCreation.js';
import { matchedData } from 'express-validator';
import { AppError } from '../middleware/GlobalErrorHandler.js';

export const getReviews = [
  ...validatePid,
  async (req: Request, res: Response, next: NextFunction) => {
    const { pId } = matchedData(req, { locations: ['params'] });
    try {
      const product = await Product.findById(pId).populate(
        'reviews.user',
        'name _id'
      );
      if (!product)
        return res.status(404).send({ Message: 'Product not found' });
      res.send(product.reviews);
    } catch (error) {
      next(new AppError((error as Error).message));
    }
  },
];

export const addReview = [
  ...validateReviewCreation,
  async (req: Request, res: Response, next: NextFunction) => {
    const { rating, comment } = matchedData(req, { locations: ['body'] });
    const { pId } = matchedData(req, { locations: ['params'] });
    const { appUser } = res.locals;

    try {
      const product = await Product.findById(pId);
      if (!product)
        return res.status(404).send({ message: 'Product not found' });

      const existingReview = product.reviews?.find(
        (review) => review.user.toString() === appUser?.id
      );
      if (existingReview)
        return res
          .status(400)
          .send({ message: 'You have already reviewed this product' });

      product.reviews.push({
        user: appUser?.id as string,
        rating: rating as number,
        comment: comment as string,
      });
      await product.save();
      res.status(201).send(product.reviews);
    } catch (error) {
      next(new AppError((error as Error).message));
    }
  },
];

export const removeReview = [
  ...validatePid,
  async (req: Request, res: Response, next: NextFunction) => {
    const { pId } = matchedData(req, { locations: ['params'] });
    const { appUser } = res.locals;

    try {
      const product = await Product.findById(pId);
      if (!product)
        return res.status(404).send({ message: 'Product not found' });

      const existingReview = product.reviews?.find(
        (review) => review.user.toString() === appUser?.id
      );
      if (!existingReview)
        return res
          .status(400)
          .send({ message: "You haven't reviewed this product" });

      const newReviews =
        product.reviews.filter(
          (review) =>
            !(review.user.toString() === existingReview.user.toString())
        ) ?? [];

      product.reviews = newReviews;
      await product.save();
      return res.status(201).send({ message: 'Review removed successfully' });
    } catch (error) {
      next(new AppError((error as Error).message));
    }
  },
];
