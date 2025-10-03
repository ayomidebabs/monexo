import mongoose from 'mongoose';
import { Redis } from 'ioredis';
import Category from '../models/Category.js';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import path from 'path';
import {
  getPublicIdFromUrl,
  uploadImagesFromLocal,
} from '../utils/cloudinary.js';
import User from '../models/User.js';
import { Types } from 'mongoose';
import Order from '../models/Order.js';
dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI as string);
    console.log(`MongoDB connected: ${conn.connection.host}`);

    // await Order.create({
    //   user: '68bd45dd6f37749dd19bc036',
    //   email: 'john@example.com',
    //   products: [
    //     {
    //       pId: '6892e7a073e2d3c0d111a92c',
    //       name: 'Laptop',
    //       quantity: 2,
    //       price: 999.99,
    //     },
    //   ],
    //   total: 1999.98,
    //   status: 'pending',
    //   paymentDetails: { method: 'card', transactionId: 'txn_123' },
    //   currency: 'USD',
    // });

    // await User.findByIdAndUpdate('68bd45dd6f37749dd19bc036', {
    //   paystackPaymentMethods: [
    //     {
    //       _id: new mongoose.Types.ObjectId(),
    //       authorizationCode: 'AUTH_7z3x9y2w1q',
    //       customerCode: 'CUS_x7y8z9a0',
    //       email: 'john.doe@example.com',
    //       cardType: 'visa',
    //       last4: '1234',
    //       expMonth: '12',
    //       expYear: '2026',
    //       isDefault: true,
    //     },
    //     {
    //       _id: new mongoose.Types.ObjectId(),
    //       authorizationCode: 'AUTH_4b6m8n3p',
    //       customerCode: 'CUS_k2m9n4p1',
    //       email: 'john.doe@example.com',
    //       cardType: 'mastercard',
    //       last4: '5678',
    //       expMonth: '09',
    //       expYear: '2027',
    //       isDefault: false,
    //     },
    //   ],
    // });

    // const directoryPath = path.join(process.cwd(), '/client/image');
    // const secureUrls = await uploadImagesFromLocal(directoryPath);

    // if (secureUrls.length === 0) {
    //   console.log({ message: 'No valid images found to upload' });
    //   throw new Error();
    // }
    // const imagePublicIds = secureUrls.map((url) => getPublicIdFromUrl(url));
    // console.log('secureurls: ', secureUrls);
    // console.log('imageids: ', imagePublicIds);

    //     const product = new Product( {
    //   name: "CargoDenim Utility",
    //   price: 59,
    //   rating: 4.0,
    //   stock: 15,
    //   description: "Utility cargo jeans with extra pockets and durable stitching.",
    //   images: secureUrls,
    //       imagePublicIds,
    //       category: "Fashion",
    //   reviews: [
    //     {
    //       user: "64d4567c98a1e2a1bc3e3215",
    //       rating: 4,
    //       comment: "Super durable. Looks better in person.",
    //       createdAt: new Date("2025-06-25")
    //     }
    //   ]
    // });
    //     console.log("saving product")
    //     product.save();
    //     console.log(`image uploaded, exiting ....`);
  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);
    process.exit(1);
  }
};
export const redis = new Redis(
  Number(process.env.REDIS_PORT),
  process.env.REDIS_HOST as string
);

redis.on('connect', () => {
  console.log('Connected to redis');
});
redis.on('error', (err) => {
  console.error('Redis error:', err);
});

export default connectDB;
// 'https://res.cloudinary.com/ddmupiyzm/image/upload/v1756162437/ecommerce/products/xdleqsj8zpmrjmdvrfi4.webp',
//   'https://res.cloudinary.com/ddmupiyzm/image/upload/v1756162450/ecommerce/products/htqcyieftxxn18lx09cz.webp',
//   'https://res.cloudinary.com/ddmupiyzm/image/upload/v1756162463/ecommerce/products/nsjm30bujabryt08ak1q.webp';
