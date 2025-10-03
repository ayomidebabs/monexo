import { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { validateUserRoleUpdate } from '../inputValidation/Admin/updateUserRole.js';
import { matchedData } from 'express-validator';
import { validatePid } from '../inputValidation/pId.js';
import { validateGetOrder } from '../inputValidation/Admin/getOrders.js';
import { validateGetUser } from '../inputValidation/Admin/getUsers.js';
import { validateProductCreation } from '../inputValidation/Product/createProduct.js';
import { validateProductUpdate } from '../inputValidation/Product/updateProduct.js';
import { validateProductDeletion } from '../inputValidation/Product/deleteProduct.js';
import {
  deleteImage,
  getPublicIdFromUrl,
  uploadImages,
} from '../utils/cloudinary.js';
import { validateCategoryCreation } from '../inputValidation/Category/createCategory.js';
import { validateCategoryUpdate } from '../inputValidation/Category/updateCategory.js';
import { validateCategoryDeletion } from '../inputValidation/Category/deleteCategory.js';
import { verifyAdmin } from '../middleware/verifyAdmin.js';
import { validateOrderUpdate } from '../inputValidation/Admin/updateOrder.js';
import { AppError } from '../middleware/GlobalErrorHandler.js';

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 4 * 1024 * 1024, files: 5 }, // 4MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError('Invalid file type', 400));
    }
  },
});

export const createProduct = [
  upload.array('images', 5),
  ...validateProductCreation,
  async (req: Request, res: Response, next: NextFunction) => {
    const files = req.files || [];

    try {
      const imageUrls = await uploadImages(files as Express.Multer.File[]);
      const imagePublicIds = imageUrls.map((url) => getPublicIdFromUrl(url));

      const product = new Product({
        ...matchedData(req),
        images: imageUrls,
        imagePublicIds,
      });
      await product.save();
      res.status(201).send(product);
    } catch (error) {
      next(new AppError((error as Error).message));
    }
  },
];

export const updateProduct = [
  upload.array('images', 5),
  ...validateProductUpdate,
  async (req: Request, res: Response, next: NextFunction) => {
    const { id, ...updateData } = matchedData(req, {
      locations: ['body', 'params'],
    });
    const files = req.files || [];
    let imageUrls: string[] = [];
    let imagePublicIds: string[] = [];

    try {
      if ((files.length as number) > 0) {
        imageUrls = await uploadImages(files as Express.Multer.File[]);
        imagePublicIds = imageUrls.map((url) => getPublicIdFromUrl(url));

        // Delete old images from Cloudinary
        const product = await Product.findById(req.params.id);
        if (product && product.imagePublicIds) {
          for (const publicId of product.imagePublicIds) {
            await deleteImage(publicId);
          }
        }

        updateData.images = imageUrls;
        updateData.imagePublicIds = imagePublicIds;
      }

      const updatedProduct = await Product.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      );
      if (!updatedProduct) {
        return next(new AppError('Product not found', 404));
      }
      res.send(updatedProduct);
    } catch (error) {
      next(new AppError((error as Error).message));
    }
  },
];

export const deleteProduct = [
  ...validateProductDeletion,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = matchedData(req, { locations: ['params'] });
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).send({ Message: 'Product not found' });
      }
      if (product.imagePublicIds) {
        for (const publicId of product.imagePublicIds) {
          await deleteImage(publicId);
        }
      }

      await Product.findByIdAndDelete(req.params.id);
      res.send({ message: 'Product deleted' });
    } catch (error) {
      next(new AppError((error as Error).message));
    }
  },
];

export const createCategory = [
  ...validateCategoryCreation,
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, description } = matchedData(req);
    try {
      const category = new Category({ name, description });
      await category.save();
      res.status(201).send(category);
    } catch (error) {
      next(new AppError((error as Error).message));
    }
  },
];

export const updateCategory = [
  ...validateCategoryUpdate,
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = matchedData(req, { locations: ['params'] });
    try {
      const category = await Category.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      }); // Validate body later
      if (!category)
        return res.status(404).send({ message: 'Category not found' });
      return res.send(category);
    } catch (error) {
      next(new AppError((error as Error).message));
    }
  },
];

export const deleteCategory = [
  ...validateCategoryDeletion,
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = matchedData(req, { locations: ['params'] });
    try {
      const category = Category.findByIdAndDelete(id);
      if (!category)
        return res.status(404).send({ message: 'Category not found' });
      res.send({ message: 'Category deleted' });
    } catch (error) {
      next(new AppError((error as Error).message));
    }
  },
];

export const getUsers = [
  ...validateGetUser,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page = 1, limit = 10 } = matchedData(req, {
        locations: ['query'],
      });
      const users = await User.find()
        .select('-password') // Exclude password
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit));
      const total = await User.countDocuments();

      res.send({ users, total, page: Number(page), limit: Number(limit) });
    } catch (error) {
      next(new AppError((error as Error).message));
    }
  },
];

export const updateUserRole = [
  ...validateUserRoleUpdate,
  async (req: Request, res: Response, next: NextFunction) => {
    const { role, id } = matchedData(req, { locations: ['body', 'params'] });

    try {
      const user = await User.findByIdAndUpdate(
        id,
        { role },
        { new: true, runValidators: true }
      ).select('-password');
      if (!user) {
        return res.status(404).send({ message: 'User not found' });
      }
      res.send(user);
    } catch (error) {
      next(new AppError((error as Error).message));
    }
  },
];

export const deleteUser = [
  ...validatePid,
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = matchedData(req, { locations: ['params'] });
    try {
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).send({ message: 'User not found' });
      }
      if (user.role === 'admin') {
        return res.status(403).send({ message: 'Cannot delete admin user' });
      }
      await User.findByIdAndDelete(req.params.id);
      res.json({ message: 'User deleted' });
    } catch (error) {
      next(new AppError((error as Error).message));
    }
  },
];

export const getAllOrders = [
  ...validateGetOrder,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        page = 1,
        limit = 10,
        status,
      } = matchedData(req, { locations: ['query'] });
      const query: any = {};
      if (status) query.status = status;

      const orders = await Order.find(query)
        .populate('user', 'name email')
        .populate('products.product', 'name price')
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit));
      const total = await Order.countDocuments(query);

      res.send({ orders, total, page: Number(page), limit: Number(limit) });
    } catch (error) {
      next(new AppError((error as Error).message));
    }
  },
];

export const updateOrderStatus = [
  ...validateOrderUpdate,
  async (req: Request, res: Response, next: NextFunction) => {
    const { status, id } = matchedData(req, { locations: ['body', 'params'] });

    try {
      const order = await Order.findByIdAndUpdate(
        id,
        { status },
        { new: true, runValidators: true }
      );
      if (!order) {
        return res.status(404).send({ message: 'Order not found' });
      }
      res.send(order);
    } catch (error) {
      next(new AppError((error as Error).message));
    }
  },
];

export const getAnalytics = [
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const totalSales = await Order.aggregate([
        { $match: { status: { $in: ['processing', 'shipped', 'delivered'] } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]);

      // Order count by status
      const orderStatusCount = await Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]);

      // Low stock products (stock <= 10)
      const lowStockProducts = await Product.find({
        stock: { $lte: 10 },
      }).select('name stock');

      res.send({
        totalSales: totalSales[0]?.total || 0,
        orderStatusCount,
        lowStockProducts,
      });
    } catch (error) {
      next(new AppError((error as Error).message));
    }
  },
];
