import { Router } from 'express';
import { getTheme, saveTheme } from '../controllers/theme.js';
import authMiddleware from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router
  .route('/theme')
  .get(authMiddleware, getTheme)
  .post(authMiddleware, saveTheme);

export default router;
