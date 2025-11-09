import mongoose from 'mongoose';
import { Redis } from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI as string);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);
    process.exit(1);
  }
};

export const redis = new Redis(
  Number(process.env.REDIS_PORT),
  process.env.REDIS_HOST as string
);

redis.on('connect', () => {
  console.log('Connected to redis');
});
redis.on('error', (err) => {
  console.error('Redis error:', err);
});

export default connectDB;
