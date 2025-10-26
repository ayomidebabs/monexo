import { Request, Response, NextFunction } from 'express';
import Order from '../models/Order.js';
import { AppError } from '../middleware/GlobalErrorHandler.js';
import { validateOrderUpdate } from '../inputValidation/Admin/updateOrder.js';
import { verifyAdmin } from '../middleware/verifyAdmin.js';
import { matchedData } from 'express-validator';
import { validateGetUserOrder } from '../inputValidation/getOrder.js';
import { Types } from 'mongoose';

export const getUserOrders = [
  ...validateGetUserOrder,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = matchedData(req, { locations: ['query'] }) as {
        page?: number;
        limit?: number;
        status?: string;
        search?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
      };

      const { appUser } = res.locals;

      const query: any = {};
      query.user = new Types.ObjectId(appUser?.id);
      if (status) query.status = status;

      const sortDirection = sortOrder === 'asc' ? 1 : -1;
      const sortField = sortBy || 'createdAt';

      const orders = await Order.aggregate([
        { $match: query },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'userData',
          },
        },
        {
          $unwind: {
            path: '$userData',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'products',
            let: { productIds: '$products.pId' },
            pipeline: [
              { $match: { $expr: { $in: ['$_id', '$$productIds'] } } },
              { $project: { name: 1, price: 1 } },
            ],
            as: 'productData',
          },
        },
        {
          $addFields: {
            products: {
              $map: {
                input: '$products',
                as: 'product',
                in: {
                  $mergeObjects: [
                    '$$product',
                    {
                      productDetails: {
                        $arrayElemAt: [
                          '$productData',
                          {
                            $indexOfArray: [
                              '$productData._id',
                              '$$product.pId',
                            ],
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
          $project: {
            _id: 1,
            email: 1,
            products: {
              $map: {
                input: '$products',
                as: 'product',
                in: {
                  pId: '$$product.pId',
                  name: '$$product.name',
                  quantity: '$$product.quantity',
                  price: '$$product.price',
                  productDetails: {
                    name: '$$product.productDetails.name',
                    price: '$$product.productDetails.price',
                  },
                },
              },
            },
            total: 1,
            status: 1,
            paymentDetails: {
              method: 1,
              transactionId: 1,
            },
            currency: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
        { $sort: { [sortField]: sortDirection } },
        { $skip: (Number(page) - 1) * Number(limit) },
        { $limit: Number(limit) },
      ]).exec();

      if (!orders.length) {
        return res.status(200).send({ orders });
      }

      const total = await Order.countDocuments(query);

      const totalPages = Math.ceil(total / Number(limit));
      const hasNextPage = Number(page) < totalPages;
      const hasPrevPage = Number(page) > 1;

      res.send({
        orders,
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
