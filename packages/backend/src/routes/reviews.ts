import { Router } from 'express';
import { getReviews, addReview, removeReview } from '../controllers/reviews.js';
import authMiddleware from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router
  .route('/:pId/reviews')
  .get(getReviews)
  .delete(authMiddleware, removeReview);
router.post('/reviews', authMiddleware, apiLimiter, addReview);

export default router;
