import { Router } from 'express';
import {
  getRecentlyViewedProducts,
  addRecentlyViewedProduct,
  mergeRecentlyViewedProducts,
} from '../controllers/recentlyViewed.js';
import authMiddleware from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router
  .route('/recently-viewed')
  .get(authMiddleware, getRecentlyViewedProducts)
  .post(authMiddleware, addRecentlyViewedProduct);
router.post(
  '/recently-viewed/merge',
  authMiddleware,
  mergeRecentlyViewedProducts
);

export default router;
