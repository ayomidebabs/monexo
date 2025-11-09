import 'express-async-errors';
import dotenv from 'dotenv';
import path from 'path';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from './middleware/cors.js';
import Stripe from 'stripe';
import appRouter from './routes/index.js';
import { errorHandler } from './middleware/GlobalErrorHandler.js';
import { ExpressAuth } from '@auth/express';
import { authConfig } from './config/auth.js';
import { verifyLockout } from './middleware/verifyLockout.js';
import { validateUserSignIn } from './inputValidation/Auth/userSignIn.js';

dotenv.config();
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(cors);
app.options('*', cors);
app.use(express.static(path.join(process.cwd(), 'client/build')));
app.use('/auth/callback/credentials', [...validateUserSignIn, verifyLockout]);
app.use('/auth', ExpressAuth(authConfig));
app.use(appRouter);
app.use(errorHandler);

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-08-27.basil',
});
export default app;
