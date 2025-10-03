import { Router } from 'express';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
} from '../controllers/wishlist.js';
import authMiddleware from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router
  .route('/wishlist')
  .get(authMiddleware, getWishlist)
  .post(authMiddleware, addToWishlist)
  .delete(authMiddleware, clearWishlist);
router.delete('/:pId/wishlist/', authMiddleware, removeFromWishlist);

export default router;
