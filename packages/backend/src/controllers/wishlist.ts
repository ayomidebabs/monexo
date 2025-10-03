import { Request, Response, NextFunction } from 'express';
import User from '../models/User.js';
import { AppError } from '../middleware/GlobalErrorHandler.js';
import { matchedData } from 'express-validator';
import { validateAddToWishlist } from '../inputValidation/addToWishlist.js';
import { validatePid } from '../inputValidation/pId.js';
import Product from '../models/Product.js';

export const getWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { appUser } = res.locals;
  try {
    const user = await User.findById(appUser?.id).select('wishlist');
    if (!user) return res.status(404).send({ message: 'User not found' });

    const wishlistPIds = user.wishlist.map((wish) => wish.pId);

    if (wishlistPIds.length === 0) {
      return res.send([]);
    }

    const wishlist = await Product.aggregate([
      { $match: { _id: { $in: wishlistPIds } } },
      {
        $addFields: {
          reviewCount: { $size: { $ifNull: ['$reviews', []] } },
          averageRating: {
            $cond: [
              { $gt: [{ $size: { $ifNull: ['$reviews', []] } }, 0] },
              {
                $round: [
                  {
                    $divide: [
                      { $sum: '$reviews.rating' },
                      { $size: '$reviews' },
                    ],
                  },
                  1,
                ],
              },
              0,
            ],
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          let: { userIds: '$reviews.user' },
          pipeline: [
            { $match: { $expr: { $in: ['$_id', '$$userIds'] } } },
            { $project: { name: 1 } },
          ],
          as: 'userData',
        },
      },
      {
        $addFields: {
          reviews: {
            $map: {
              input: '$reviews',
              as: 'review',
              in: {
                $mergeObjects: [
                  '$$review',
                  {
                    user: {
                      $arrayElemAt: [
                        '$userData',
                        {
                          $indexOfArray: ['$userData._id', '$$review.user'],
                        },
                      ],
                    },
                  },
                ],
              },
            },
          },
        },
      },
      {
        $addFields: {
          reviews: {
            $cond: [
              { $eq: ['$reviews', []] },
              [],
              {
                $map: {
                  input: '$reviews',
                  as: 'review',
                  in: {
                    user: { name: '$$review.user.name' },
                    rating: '$$review.rating',
                    comment: '$$review.comment',
                    createdAt: '$$review.createdAt',
                  },
                },
              },
            ],
          },
        },
      },
      {
        $project: {
          userData: 0,
        },
      },
    ]).exec();

    res.send(wishlist);
  } catch (error) {
    next(new AppError((error as Error).message));
  }
};

export const addToWishlist = [
  ...validateAddToWishlist,
  async (req: Request, res: Response, next: NextFunction) => {
    const { pId } = matchedData(req);
    const { appUser } = res.locals;
    try {
      const user = await User.findById(appUser?.id).select('wishlist');
      if (!user) return res.status(404).send({ message: 'User not found' });

      const existingProduct = user.wishlist.find((item) =>
        item.pId.equals(pId)
      );
      if (existingProduct)
        return res.status(400).send({ message: 'Product already exists' });

      user.wishlist.push({ pId });
      await user.save();
      return res.status(201).send({ message: 'Product added to wishlist' });
    } catch (error) {
      next(new AppError((error as Error).message));
    }
  },
];

export const removeFromWishlist = [
  ...validatePid,
  async (req: Request, res: Response, next: NextFunction) => {
    const { pId } = matchedData(req, { locations: ['params'] });
    const { appUser } = res.locals;

    try {
      const user = await User.findById(appUser?.id).select('wishlist');
      if (!user) return res.status(404).send({ message: 'User not found' });

      const existingProduct = user.wishlist.find((product) =>
        product.pId.equals(pId)
      );

      if (!existingProduct) {
        return res.send({ message: "Product doesn't exists" });
      }

      const newWishlist =
        user.wishlist.filter(
          (product) => !(product.pId === existingProduct.pId)
        ) ?? [];

      user.wishlist = newWishlist;
      await user.save();
      return res
        .status(201)
        .send({ message: 'Product removed from wish list' });
    } catch (error) {
      next(new AppError((error as Error).message));
    }
  },
];

export const clearWishlist = [
  async (req: Request, res: Response, next: NextFunction) => {
    const { appUser } = res.locals;
    try {
      const user = await User.findById(appUser?.id).select('wishlist');
      if (!user) return res.status(404).send({ message: 'User not found' });
      user.wishlist = [];
      await user.save();
      return res.status(201).send({ message: ' Wishlist cleared' });
    } catch (error) {
      next(new AppError((error as Error).message));
    }
  },
];
