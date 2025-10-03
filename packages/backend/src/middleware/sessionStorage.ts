import dotenv from 'dotenv';
dotenv.config();
import session from 'express-session';
import { redis } from '../config/db.js';
import { RedisStore } from 'connect-redis';
import ConnectMongo from 'connect-mongo';
const mongoStore = new ConnectMongo({
  collectionName: 'sesssions',
  ttl: 14 * 24 * 60 * 60,
  mongoUrl: 'mongodb://localhost:27017/ecommerce',
});

export const sessionStorage = session({
  secret: process.env.SESSION_SECRET as string,
  resave: false,
  saveUninitialized: false,
  name: 'sId',
  cookie: {
    maxAge: 14 * 24 * 60 * 60,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  },
  // store: mongoStore,
});

//  new RedisStore({
//     client: redis,
//     ttl: 14 * 24 * 60 * 60,
// })
