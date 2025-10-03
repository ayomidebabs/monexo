import dotenv from "dotenv";
dotenv.config();
import { v2 as cloudinary } from 'cloudinary';
import path from "path";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const productImageTransformations = {
  transformation: [
    { width: 800, height: 800, crop: 'limit', quality: 'auto', fetch_format: 'webp' },
    { fetch_format: 'auto' },
  ],
  folder: 'ecommerce/products',
};

export default cloudinary;