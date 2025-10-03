import { Router } from 'express';
import {
  getUsers,
  updateUserRole,
  deleteUser,
  getAllOrders,
  updateOrderStatus,
  getAnalytics,
  createProduct,
  updateProduct,
  deleteProduct,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/admin.js';

import authMiddleware from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.get('/users', getUsers);
router.route('/users/:id').patch(updateUserRole).delete(deleteUser);

router.post('/products', createProduct);
router
  .route('/products/:id')
  .patch(updateProduct)
  .delete(apiLimiter, deleteProduct);

router.post('/categories', createCategory);
router
  .route('/categories/:id')
  .patch(updateCategory)
  .delete(apiLimiter, deleteCategory);

router.get('/orders', getAllOrders);
router.patch('/orders/:id', updateOrderStatus);

router.get('/analytics', getAnalytics);

export default router;
