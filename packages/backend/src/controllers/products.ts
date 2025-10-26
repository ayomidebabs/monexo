import { Request, Response, NextFunction } from 'express';
import Product from '../models/Product.js';
import { matchedData } from 'express-validator';
import { AppError } from '../middleware/GlobalErrorHandler.js';
import { validateGetProduct } from '../inputValidation/Product/getProduct.js';
import { ProductQuery } from '../types/product.js';
import { validatePid } from '../inputValidation/pId.js';
import { Types } from 'mongoose';

export const getProduct = [
  ...validatePid,
  async (req: Request, res: Response, next: NextFunction) => {
    const { pId } = matchedData(req, { locations: ['params'] });

    try {
      const productId = new Types.ObjectId(pId);

      const [product] = await Product.aggregate([
        { $match: { _id: productId } },
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
                        { $sum: { $ifNull: ['$reviews.rating', 0] } },
                        { $size: { $ifNull: ['$reviews', []] } },
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

      if (!product) {
        return res.status(404).send({ message: 'Product not found' });
      }
      res.send(product);
    } catch (error) {
      next(new AppError((error as Error).message));
    }
  },
];

export const getProducts = [
  ...validateGetProduct,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        page = 1,
        limit = 10,
        category,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = matchedData(req, { locations: ['query'] }) as ProductQuery;

      const query: any = {};
      if (category) query.category = category;
      if (search) query.name = { $regex: search, $options: 'i' };

      const sortDirection = sortOrder === 'asc' ? 1 : -1;
      const sortField = sortBy || 'createdAt';

      const products = await Product.aggregate([
        { $match: query },
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
                        { $sum: { $ifNull: ['$reviews.rating', 0] } },
                        { $size: { $ifNull: ['$reviews', []] } },
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
              $cond: [
                { $eq: ['$reviews', []] },
                [],
                {
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
                                $indexOfArray: [
                                  '$userData._id',
                                  '$$review.user',
                                ],
                              },
                            ],
                          },
                        },
                      ],
                    },
                  },
                },
              ],
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
            _id: 1,
            name: 1,
            description: 1,
            price: 1,
            category: 1,
            createdAt: 1,
            images: 1,
            stock: 1,
            imagePublicIds: 1,
            reviews: 1,
            reviewCount: 1,
            averageRating: 1,
          },
        },
        { $sort: { [sortField]: sortDirection } },
        { $skip: (Number(page) - 1) * Number(limit) },
        { $limit: Number(limit) },
      ]).exec();

      if (!products.length) {
        return res.status(404).send({ message: 'No products found' });
      }

      const total = await Product.countDocuments(query);

      const totalPages = Math.ceil(total / Number(limit));
      const hasNextPage = Number(page) < totalPages;
      const hasPrevPage = Number(page) > 1;

      res.send({
        products,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages,
        hasNextPage,
        hasPrevPage,
      });
    } catch (error) {
      next(new AppError((error as Error).message));
    }
  },
];
