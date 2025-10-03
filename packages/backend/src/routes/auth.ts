import { Router } from 'express';
import {
  signUp,
  sendUser,
  notifySignInSuccess,
  notifySignOutSuccess,
} from '../controllers/auth.js';
import { signInLimiter } from '../middleware/rateLimiter.js';
import authMiddleware from '../middleware/auth.js';

const router = Router();

router.route('/signup').post(signUp);
router.route('/me').get(authMiddleware, sendUser);
router.get('/signin-success', authMiddleware, notifySignInSuccess);
router.get('/signout-success', notifySignOutSuccess);

export default router;
