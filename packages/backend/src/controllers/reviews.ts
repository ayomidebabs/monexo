import { NextFunction, Request, Response } from 'express';
import Product from '../models/Product.js';
import { validatePid } from '../inputValidation/pId.js';
import { validateReviewCreation } from '../inputValidation/reviewCreation.js';
import { matchedData } from 'express-validator';
import { AppError } from '../middleware/GlobalErrorHandler.js';
import mongoose from 'mongoose';

export const getReviews = [
  ...validatePid,
  async (req: Request, res: Response, next: NextFunction) => {
    const { pId } = matchedData(req, { locations: ['params'] });
    try {
      const products = await Product.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(pId) } },
        { $unwind: '$reviews' },
        { $sort: { 'reviews.createdAt': -1 } },
        {
          $lookup: {
            from: 'users',
            localField: 'reviews.user',
            foreignField: '_id',
            as: 'reviews.user',
          },
        },
        { $unwind: '$reviews.user' },
        {
          $group: {
            _id: '$_id',
            reviews: {
              $push: {
                user: '$reviews.user',
                rating: '$reviews.rating',
                comment: '$reviews.comment',
                createdAt: '$reviews.createdAt',
                _id: '$reviews._id',
              },
            },
          },
        },
        {
          $project: {
            reviews: {
              $map: {
                input: '$reviews',
                as: 'review',
                in: {
                  user: {
                    _id: '$$review.user._id',
                    name: '$$review.user.name',
                  },
                  rating: '$$review.rating',
                  comment: '$$review.comment',
                  createdAt: '$$review.createdAt',
                  _id: '$$review._id',
                },
              },
            },
          },
        },
      ]);

      if (!products.length) {
        return res.status(404).send({ message: 'Product not found' });
      }

      console.log(products[0].reviews);
      res.send(products[0].reviews);
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
      res.status(201).send({ message: 'Review created' });
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
