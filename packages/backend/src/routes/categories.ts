import { Router } from 'express';
import { getCategories } from '../controllers/categories.js';
import authMiddleware from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = Router();
router.get('/', getCategories);

export default router;
